import { Buffer } from 'node:buffer'
import { cp, mkdir, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { parseOptions } from '../options.mjs'
import { runSuite } from '../runner.mjs'
import { finalizeCapture } from './finalize.mjs'
import { installMarkers } from './phase-markers.mjs'
import { artifactHashes, sourceProvenance } from './provenance.mjs'
import { summarizeCapture } from './summarize.mjs'
import { writeViewer } from './viewer.mjs'

const ROOT = fileURLToPath(new URL('../../../../', import.meta.url))
const CATEGORIES = 'devtools.timeline,v8,blink.user_timing,disabled-by-default-devtools.timeline,disabled-by-default-devtools.timeline.stack'

/** Shared identity for collection and final validity reconciliation. */
function captureId(trial) {
  return `${trial.workload}-${trial.count}-${trial.mode}-pair${trial.pair}`
}

/** Validate tracing extras before server/browser allocation; normal runner options stay shared. */
export function traceOptions(args) {
  const extras = { appRoot: join(ROOT, 'packages/benchmarks/dist'), libraryRoot: join(ROOT, 'packages/vue-virtual-scroller/dist'), stage: 'diagnostic', columnPolicy: 'unspecified', sourceSha: undefined, librarySha: undefined, harnessSha: undefined, libraryPatchHash: undefined, harnessPatchHash: undefined }
  const names = { 'app-root': 'appRoot', 'library-root': 'libraryRoot', 'stage': 'stage', 'column-policy': 'columnPolicy', 'source-sha': 'sourceSha', 'library-sha': 'librarySha', 'harness-sha': 'harnessSha', 'library-patch-hash': 'libraryPatchHash', 'harness-patch-hash': 'harnessPatchHash' }
  const common = []
  for (let index = 0; index < args.length; index++) {
    const argument = args[index]
    const name = argument.slice(2)
    // Common option values remain opaque; inherited Object keys are not flags.
    const key = argument.startsWith('--') && Object.hasOwn(names, name) ? names[name] : undefined
    if (key) {
      if (!args[index + 1] || args[index + 1].startsWith('--'))
        throw new Error(`Incomplete option: ${args[index]}`)
      extras[key] = args[++index]
    }
    else {
      common.push(argument)
      // Keep common option/operand pairs atomic, even when an invalid operand
      // looks like a tracing flag. The shared parser owns their validation;
      // only its separator and headed switch have no operand.
      if (argument.startsWith('--') && argument !== '--' && argument !== '--headed' && index + 1 < args.length)
        common.push(args[++index])
    }
  }
  if (args.includes('--app-root') !== args.includes('--library-root'))
    throw new Error('Provide both --app-root and --library-root for immutable captures')
  const options = parseOptions(common, ROOT)
  if (!common.includes('--browser'))
    options.browser = 'chromium'
  if (options.browser !== 'chromium')
    throw new Error('CDP tracing supports chromium only; normal benchmarks support Firefox')
  return { ...options, ...extras, appRoot: resolve(ROOT, extras.appRoot), libraryRoot: resolve(ROOT, extras.libraryRoot) }
}

/** Stream Chrome evidence to disk after stop; never print large trace payloads. */
async function readCapture(session, output, id) {
  const { profile } = await session.send('Profiler.stop')
  await writeFile(join(output, `${id}.cpuprofile`), JSON.stringify(profile))
  const complete = new Promise(resolve => session.once('Tracing.tracingComplete', resolve))
  await session.send('Tracing.end')
  const { stream } = await complete
  const chunks = []
  try {
    while (true) {
      const part = await session.send('IO.read', { handle: stream })
      chunks.push(Buffer.from(part.data, part.base64Encoded ? 'base64' : 'utf8'))
      if (part.eof)
        break
    }
  }
  finally { await session.send('IO.close', { handle: stream }) }
  await writeFile(join(output, `${id}.trace.json`), Buffer.concat(chunks))
}

/** Bound stream shutdown even if Chrome disconnects after Tracing.end. */
async function stopCapture(page, session, output, id) {
  if (page.isClosed())
    throw new Error('Page closed before diagnostic shutdown')
  let timer
  let closed
  const interrupted = new Promise((resolve, reject) => {
    closed = () => reject(new Error('Page closed during diagnostic shutdown'))
    page.once('close', closed)
    timer = setTimeout(() => reject(new Error('Diagnostic shutdown exceeded 10000ms')), 10000)
  })
  try {
    await Promise.race([readCapture(session, output, id), interrupted])
  }
  finally {
    clearTimeout(timer)
    page.removeListener('close', closed)
  }
}

/** Reuse full benchmark lifecycle, warmups/order/verification and owned-resource cleanup. */
export async function captureSuite(options) {
  await mkdir(options.output, { recursive: true })
  // Exclusive manifest creation protects previous raw evidence from accidental overwrite.
  const manifestPath = join(options.output, 'manifest.json')
  const manifest = { schemaVersion: 1, status: 'partial', started: new Date().toISOString(), source: await sourceProvenance(ROOT), librarySourceSha: options.librarySha ?? options.sourceSha ?? null, harnessSourceSha: options.harnessSha ?? options.sourceSha ?? null, libraryDirtyPatchHash: options.libraryPatchHash ?? null, harnessDirtyPatchHash: options.harnessPatchHash ?? null, stage: options.stage, columnPolicy: options.columnPolicy, categories: CATEGORIES, samplingIntervalMicroseconds: 1000, captures: [], phaseMethod: 'private exact observer when present; explicit returned-duration fallback for frozen legacy bundles', note: 'Instrumented diagnostic evidence; use uninstrumented reports for performance comparisons.' }
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2), { flag: 'wx' })
  const save = () => writeFile(manifestPath, JSON.stringify(manifest, null, 2))
  try {
    await cp(options.appRoot, join(options.output, 'app'), { recursive: true })
    await cp(options.libraryRoot, join(options.output, 'library'), { recursive: true })
    manifest.appHashes = await artifactHashes(join(options.output, 'app'))
    manifest.libraryHashes = await artifactHashes(join(options.output, 'library'))
    const report = await runSuite({ ...options, appRoot: join(options.output, 'app'), observeTrial: async (page, base) => {
      if (base.warmup)
        return
      const id = captureId(base)
      await installMarkers(page)
      const session = await page.context().newCDPSession(page)
      await session.send('Profiler.enable')
      await session.send('Profiler.setSamplingInterval', { interval: 1000 })
      await session.send('Tracing.start', { categories: CATEGORIES, transferMode: 'ReturnAsStream' })
      await session.send('Profiler.start')
      return async (trial) => {
        const capture = { id, valid: trial.valid, error: trial.error }
        manifest.captures.push(capture)
        await writeFile(join(options.output, `${id}.result.json`), JSON.stringify(trial, null, 2))
        try {
          await stopCapture(page, session, options.output, id)
          capture.phaseEvidence = await page.evaluate(() => window.profileSpans)
          capture.boundaryMethod = capture.phaseEvidence.some(span => span.boundary) ? 'returned-duration fallback' : 'private exact observer'
          capture.loadedAssets = await page.evaluate(() => performance.getEntriesByType('resource').map(entry => new URL(entry.name).pathname))
          await summarizeCapture(options.output, id)
        }
        catch (error) {
          capture.valid = false
          capture.error = error.message
          await writeFile(join(options.output, `${id}.result.json`), JSON.stringify({ ...trial, valid: false, diagnosticError: error.message }, null, 2))
          throw error
        }
        finally {
          await session.detach().catch(() => {})
          await save()
        }
      }
    }, onTrialComplete: async (trial) => {
      if (trial.warmup)
        return
      const capture = manifest.captures.find(entry => entry.id === captureId(trial))
      if (!capture)
        return
      await finalizeCapture(options.output, capture, trial, save)
    } })
    manifest.environment = report.metadata
    await writeViewer(options.output, manifest.captures.filter(capture => capture.valid).map(capture => capture.id))
    manifest.status = report.status
    return report
  }
  catch (error) {
    manifest.error = error.message
    throw error
  }
  finally {
    manifest.ended = new Date().toISOString()
    await save()
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const report = await captureSuite(traceOptions(process.argv.slice(2)))
    process.exitCode = report.status === 'cancelled' ? 130 : report.status === 'complete' ? 0 : 1
  }
  catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}

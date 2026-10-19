import { mkdir, rename, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'
import { chromium, firefox } from 'playwright'
import { markdown } from '../reports/summary.mjs'
import { WORKLOADS } from '../workloads/registry.ts'
import { environment } from './environment.mjs'
import { startServer } from './server.mjs'

/** Persist raw progress after every trial, including interruptions and failures. */
async function save(report, output) {
  await mkdir(output, { recursive: true })
  const snapshot = { ...report }
  // Keep last complete artifacts readable even if process is forcibly stopped during a write.
  await writeFile(join(output, 'report.json.tmp'), `${JSON.stringify(snapshot, null, 2)}\n`)
  await writeFile(join(output, 'report.md.tmp'), markdown(snapshot))
  await rename(join(output, 'report.json.tmp'), join(output, 'report.json'))
  await rename(join(output, 'report.md.tmp'), join(output, 'report.md'))
  if (snapshot.status !== report.status)
    await save(report, output)
}
/** Run serially. Performance variability never affects exit status; correctness does. */
export async function runSuite(options) {
  const report = { schemaVersion: 1, status: 'partial', metadata: environment(options), trials: [] }
  let server
  let browser
  let context
  let cancelled = false
  const interrupt = () => {
    cancelled = true
    report.status = 'cancelled'
    void context?.close().catch(() => {})
  }
  process.once('SIGINT', interrupt)
  process.once('SIGTERM', interrupt)
  try {
    await save(report, options.output)
    server = await startServer()
    const engines = options.browser === 'all' ? ['chromium', 'firefox'] : [options.browser]
    for (const engine of engines) {
      if (cancelled)
        break
      // Playwright's default signal handler can exit before report flushing finishes.
      // Only this owner handles termination, closes resources, and persists final status.
      browser = await ({ chromium, firefox })[engine].launch({ headless: !options.headed, handleSIGINT: false, handleSIGTERM: false, handleSIGHUP: false })
      report.metadata[`${engine}Version`] = browser.version()
      for (const workload of WORKLOADS.filter(item => options.workload === 'all' || item.id === options.workload)) {
        for (const count of options.counts) {
          for (let pair = -1; pair < options.trials; pair++) {
            if (cancelled)
              break
            const modes = pair % 2 === 0 ? ['virtual', 'plain'] : ['plain', 'virtual']
            for (const mode of modes) {
              if (cancelled)
                break
              const config = { workload: workload.id, mode, count, seed: options.seed }
              const base = { ...config, browser: engine, pair, warmup: pair < 0, valid: false, actualCount: count, phases: {}, frames: [], scroll: {}, checkpoints: [] }
              let trial = base
              let watchdog
              try {
                context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1, locale: 'en-US', timezoneId: 'UTC' })
                const ownedContext = context
                watchdog = setTimeout(() => {
                  void ownedContext.close()
                }, 120_000)
                const page = await context.newPage()
                const errors = []
                page.on('pageerror', error => errors.push(error.message))
                page.on('crash', () => errors.push('Browser page crashed'))
                await page.goto(`${server.url}/case.html?${new URLSearchParams(config)}`)
                await page.waitForFunction(() => window.benchmark || window.benchmarkError, undefined, { timeout: 15000 })
                const error = await page.evaluate(() => window.benchmarkError)
                if (error)
                  throw new Error(error)
                // The browser timer aborts callbacks; Playwright timeout also catches a blocked main thread.
                trial = { ...base, ...await page.evaluate(() => window.benchmark.run()) }
                if (errors.length) {
                  trial.valid = false
                  trial.error = errors.join('; ')
                }
              }
              catch (error) {
                trial.valid = false
                trial.error = error.message
              }
              finally {
                clearTimeout(watchdog)
                await context?.close().catch(() => {})
                context = undefined
              }
              report.trials.push(trial)
              console.log(`${engine} ${workload.id} ${count} ${mode} ${pair < 0 ? 'warmup' : `pair ${pair + 1}`} ${trial.valid ? 'valid' : trial.error}`)
              await save(report, options.output)
            }
          }
        }
      }
      await browser.close()
      browser = undefined
    }
    report.status = cancelled ? 'cancelled' : report.trials.every(trial => trial.valid) ? 'complete' : 'partial'
  }
  catch (error) { report.metadata.error = error.message }
  finally {
    await context?.close().catch(() => {})
    await browser?.close().catch(() => {})
    await server?.close().catch((error) => {
      report.status = 'partial'
      report.metadata.cleanupError = error.message
    })
    await save(report, options.output)
    process.removeListener('SIGINT', interrupt)
    process.removeListener('SIGTERM', interrupt)
  }
  console.log(`Report: ${options.output}/report.md`)
  return report
}

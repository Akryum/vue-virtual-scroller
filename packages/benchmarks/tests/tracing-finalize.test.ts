import type { TrialResult } from '../measurement/types'
import type { CaptureFinalState } from '../scripts/tracing/finalize.mjs'
import { chmod, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import process from 'node:process'
import { afterEach, expect, it } from 'vitest'
import { finalizeCapture } from '../scripts/tracing/finalize.mjs'

const outputs: string[] = []
afterEach(async () => {
  for (const output of outputs.splice(0)) {
    await chmod(join(output, 'trial.analysis.json'), 0o644).catch(() => {})
    await rm(output, { recursive: true, force: true })
  }
})

/** Real provisional files; register cleanup before acquiring any later resources. */
async function createEvidence() {
  const output = await mkdtemp(join(tmpdir(), 'vvs-trace-finalize-'))
  outputs.push(output)
  const resultPath = join(output, 'trial.result.json')
  const analysisPath = join(output, 'trial.analysis.json')
  const phases = { mount: 10, select: 20 }
  const trial: TrialResult = { workload: 'issue-inbox', mode: 'virtual', count: 30, seed: 2026, actualCount: 30, valid: true, phases, frames: [16], scroll: {}, checkpoints: [] }
  const capture: CaptureFinalState = { id: 'trial', valid: true }
  await writeFile(resultPath, JSON.stringify({ valid: true, phases, diagnosticError: 'Retained collection evidence' }))
  await writeFile(analysisPath, JSON.stringify({ valid: true, phases: [{ phase: 'mount', duration: 10 }] }))
  return { output, resultPath, analysisPath, capture, trial }
}

// Preflight: real artifact IO replaces provisional validity and preserves exact
// raw timings/diagnostics. Browser regression covers native error delivery order.
it('publishes late failure consistently without discarding captured evidence', async () => {
  const { output, resultPath, analysisPath, capture, trial } = await createEvidence()
  trial.valid = false
  trial.error = 'Late page failure'
  await finalizeCapture(output, capture, trial)
  expect(capture).toEqual({ id: 'trial', valid: false, error: 'Late page failure' })
  expect(JSON.parse(await readFile(resultPath, 'utf8'))).toEqual({ ...trial, diagnosticError: 'Retained collection evidence' })
  expect(JSON.parse(await readFile(analysisPath, 'utf8'))).toEqual({ valid: false, error: 'Late page failure', phases: [{ phase: 'mount', duration: 10 }] })
})

// Real manifest IO fails after artifact publication. Both writable peers must
// reject the trial even when authoritative manifest IO remains broken.
it('invalidates result and analysis when final manifest publication fails', async () => {
  const { output, resultPath, analysisPath, capture, trial } = await createEvidence()
  const manifestPath = join(output, 'manifest.json')
  await mkdir(manifestPath)
  const publishManifest = () => writeFile(manifestPath, JSON.stringify(capture))
  await expect(finalizeCapture(output, capture, trial, publishManifest)).rejects.toThrow('EISDIR')
  expect(capture).toMatchObject({ valid: false, unreconciledArtifacts: [{ path: 'manifest.json', error: expect.stringContaining('EISDIR') }] })
  expect(JSON.parse(await readFile(resultPath, 'utf8'))).toEqual({ ...trial, valid: false, error: capture.error, diagnosticError: 'Retained collection evidence' })
  expect(JSON.parse(await readFile(analysisPath, 'utf8'))).toEqual({ valid: false, phases: [{ phase: 'mount', duration: 10 }], error: capture.error })
})

// Native Unix permissions reject analysis publication. Root bypasses this file
// contract; manifest failure above also exercises recovery without that privilege.
it.skipIf(process.getuid?.() === 0 || process.platform === 'win32')('invalidates writable evidence when analysis publication fails', async () => {
  const { output, resultPath, analysisPath, capture, trial } = await createEvidence()
  await chmod(analysisPath, 0o444)
  await expect(finalizeCapture(output, capture, trial)).rejects.toThrow('EACCES')
  expect(capture.valid).toBe(false)
  expect(capture.error).toContain('Diagnostic finalization failed: EACCES')
  expect(JSON.parse(await readFile(resultPath, 'utf8'))).toEqual({ ...trial, valid: false, error: capture.error, diagnosticError: 'Retained collection evidence' })
  expect(capture.unreconciledArtifacts).toEqual([{ path: 'trial.analysis.json', error: expect.stringContaining('EACCES') }])
  expect(JSON.parse(await readFile(analysisPath, 'utf8'))).toEqual({ valid: true, phases: [{ phase: 'mount', duration: 10 }] })
})

import { spawn } from 'node:child_process'
import { cp, mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { expect, test } from '@playwright/test'

const MODULE_SCRIPT = /<script[^>]+type="module"[^>]*><\/script>/

/** Real production runner subprocess; normal exit requires releasing owned server/browser. */
function run(appRoot: string, output: string) {
  const runner = new URL('../../scripts/runner.mjs', import.meta.url).href
  const options = { profile: 'quick', browser: 'chromium', workload: 'issue-inbox', counts: [30], trials: 1, seed: 2026, headed: false, appRoot, output, modes: ['virtual'] }
  const code = `const {runSuite}=await import(${JSON.stringify(runner)});const report=await runSuite(${JSON.stringify(options)});process.exitCode=report.status==='complete'?0:1`
  return new Promise<number | null>((resolve, reject) => {
    const child = spawn(process.execPath, ['--input-type=module', '-e', code], { stdio: ['ignore', 'pipe', 'pipe'] })
    const timeout = setTimeout(() => {
      child.kill('SIGTERM')
      reject(new Error('Failure evidence subprocess did not close resources'))
    }, 80_000)
    child.once('error', (error) => {
      clearTimeout(timeout)
      reject(error)
    })
    child.once('exit', (status) => {
      clearTimeout(timeout)
      resolve(status)
    })
  })
}

// Preflight: isolated broken module prevents controller publication; real renderer throws,
// runner times out unchanged15s, and decisive browser error must survive catch/cleanup.
test('startup failure retains module error and timeout, then repaired real case runs', async ({ browserName }) => {
  test.skip(browserName !== 'chromium')
  const directory = await mkdtemp(join(tmpdir(), 'vvs-startup-evidence-'))
  const app = join(directory, 'app')
  await cp(fileURLToPath(new URL('../../dist/', import.meta.url)), app, { recursive: true })
  const html = await readFile(join(app, 'case.html'), 'utf8')
  const broken = html.replace(MODULE_SCRIPT, '<script type="module">throw new Error("Deliberate startup module failure")</script>')
  expect(broken).not.toBe(html)
  await writeFile(join(app, 'case.html'), broken)
  const failedOutput = join(directory, 'failed')
  expect(await run(app, failedOutput)).toBe(1)
  const report = JSON.parse(await readFile(join(failedOutput, 'report.json'), 'utf8'))
  expect(report.status).toBe('partial')
  expect(report.trials).toHaveLength(2)
  for (const trial of report.trials) {
    expect(trial.valid).toBe(false)
    expect(trial.phases).toEqual({})
    expect(trial.error).toContain('Timeout 15000ms exceeded')
    expect(trial.error).toContain('Deliberate startup module failure')
    expect(trial.failure).toMatchObject({ stage: 'startup', name: 'TimeoutError', startup: { readyState: 'complete', controllerPublished: false } })
    expect(trial.failure.pageErrors[0]).toMatchObject({ name: 'Error', message: 'Deliberate startup module failure' })
    expect(trial.failure.pageErrors[0].stack).toContain('case.html')
  }
  await writeFile(join(app, 'case.html'), html)
  const recoveredOutput = join(directory, 'recovered')
  expect(await run(app, recoveredOutput)).toBe(0)
  const recovered = JSON.parse(await readFile(join(recoveredOutput, 'report.json'), 'utf8'))
  expect(recovered.status).toBe('complete')
  expect(recovered.trials).toHaveLength(2)
  expect(recovered.trials.every((trial: { workload: string, mode: string }) => trial.workload === 'issue-inbox' && trial.mode === 'virtual')).toBe(true)
  expect(recovered.trials.every((trial: { valid: boolean, phases: { select: number } }) => trial.valid && trial.phases.select > 0)).toBe(true)
})

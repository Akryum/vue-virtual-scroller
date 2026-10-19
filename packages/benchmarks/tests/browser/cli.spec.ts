import { spawn } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { expect, test } from '@playwright/test'

/** Real CLI subprocess, including production server and both actual browser engines. */
function cli(output: string, interrupt = false, browser = 'all', signal: 'SIGINT' | 'SIGTERM' = 'SIGINT') {
  return new Promise<number | null>((resolve, reject) => {
    const child = spawn(process.execPath, ['scripts/run.mjs', '--browser', browser, '--workload', 'issue-inbox', '--count', '30', '--trials', '1', '--output', output], { cwd: fileURLToPath(new URL('../../', import.meta.url)), stdio: ['ignore', 'pipe', 'pipe'] })
    let stopped = false
    const timeout = setTimeout(() => {
      child.kill('SIGTERM')
      reject(new Error('CLI did not terminate'))
    }, 100_000)
    child.stdout.on('data', (chunk) => {
      if (interrupt && !stopped && chunk.toString().includes('warmup')) {
        stopped = true
        child.kill(signal)
      }
    })
    child.once('error', (error) => {
      clearTimeout(timeout)
      reject(error)
    })
    child.once('exit', (code) => {
      clearTimeout(timeout)
      resolve(code)
    })
  })
}

test('CLI writes complete paired reports for both real engines', async ({ browserName }) => {
  test.skip(browserName !== 'chromium')
  const output = join(tmpdir(), `vvs-cli-${process.pid}`)
  expect(await cli(output)).toBe(0)
  const report = JSON.parse(await readFile(join(output, 'report.json'), 'utf8'))
  expect(report.status).toBe('complete')
  expect(report.trials).toHaveLength(8)
  expect(new Set(report.trials.map((trial: { browser: string }) => trial.browser))).toEqual(new Set(['chromium', 'firefox']))
  expect(report.trials.every((trial: { valid: boolean, phases: { select: number } }) => trial.valid && trial.phases.select > 0)).toBe(true)
  expect(await readFile(join(output, 'report.md'), 'utf8')).toContain('issue-inbox')
})

test('interrupted CLI saves cancellation and next invocation can own a new server', async ({ browserName }) => {
  test.skip(browserName !== 'chromium')
  const output = join(tmpdir(), `vvs-cancel-${process.pid}`)
  for (const signal of ['SIGINT', 'SIGTERM'] as const) {
    const destination = `${output}-${signal}`
    expect(await cli(destination, true, 'all', signal)).toBe(130)
    const report = JSON.parse(await readFile(join(destination, 'report.json'), 'utf8'))
    expect(report.status).toBe('cancelled')
    expect(report.trials.length).toBeGreaterThan(0)
  }
  const resumed = `${output}-resumed`
  expect(await cli(resumed, false, 'chromium')).toBe(0)
  expect(JSON.parse(await readFile(join(resumed, 'report.json'), 'utf8')).status).toBe('complete')
})

import { spawn } from 'node:child_process'
import { mkdtemp, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import process from 'node:process'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { expect, test } from '@playwright/test'
import { chromium } from 'playwright'

/** Actual tracing CLI; process signals exercise owner cleanup rather than calling helpers. */
function capture(output: string, signal?: 'SIGINT' | 'SIGTERM') {
  return new Promise<number | null>((resolve, reject) => {
    const child = spawn(process.execPath, ['scripts/tracing/capture.mjs', '--workload', 'issue-inbox', '--count', '30', '--trials', signal ? '2' : '1', '--output', output], {
      cwd: fileURLToPath(new URL('../../', import.meta.url)),
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    let stderr = ''
    let interrupted = false
    const timeout = setTimeout(() => {
      child.kill('SIGTERM')
      reject(new Error(`Trace CLI timed out: ${stderr.slice(-500)}`))
    }, 90_000)
    child.stderr.on('data', chunk => stderr += chunk.toString())
    child.stdout.on('data', (chunk) => {
      if (signal && !interrupted && chunk.toString().includes('pair 1')) {
        interrupted = true
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

// Preflight: public CLI executes shipped production case, real Vue/list and controller checks.
// Empty-but-parseable evidence fails expected actions, records, phase marks and nonzero samples.
test('trace CLI captures real verified phases and preserves signal-interrupted evidence', async ({ browserName }) => {
  test.skip(browserName !== 'chromium')
  test.setTimeout(180_000)
  for (const signal of ['SIGINT', 'SIGTERM'] as const) {
    const output = await mkdtemp(join(tmpdir(), `vvs-trace-${signal}-`))
    expect(await capture(output, signal)).toBe(130)
    const manifest = JSON.parse(await readFile(join(output, 'manifest.json'), 'utf8'))
    expect(manifest.status).toBe('cancelled')
    expect(manifest.captures.some((entry: { valid: boolean }) => entry.valid)).toBe(true)
  }
  const output = await mkdtemp(join(tmpdir(), 'vvs-trace-complete-'))
  expect(await capture(output)).toBe(0)
  const manifest = JSON.parse(await readFile(join(output, 'manifest.json'), 'utf8'))
  expect(manifest.status).toBe('complete')
  expect(manifest.captures).toHaveLength(2)
  expect(Object.keys(manifest.libraryHashes).some(path => path.endsWith('.js'))).toBe(true)
  for (const entry of manifest.captures) {
    expect(entry.boundaryMethod).toBe('private exact observer')
    const result = JSON.parse(await readFile(join(output, `${entry.id}.result.json`), 'utf8'))
    const profile = JSON.parse(await readFile(join(output, `${entry.id}.cpuprofile`), 'utf8'))
    const trace = JSON.parse(await readFile(join(output, `${entry.id}.trace.json`), 'utf8'))
    const analysis = JSON.parse(await readFile(join(output, `${entry.id}.analysis.json`), 'utf8'))
    expect(result.valid).toBe(true)
    expect(result.checkpoints[0].total).toBe(30)
    expect(result.phases.select).toBeGreaterThan(0)
    expect(profile.samples.length).toBeGreaterThan(0)
    expect(trace.traceEvents.some((event: { name: string }) => event.name === 'benchmark:0:mount:start')).toBe(true)
    expect(analysis.phases.map((phase: { phase: string }) => phase.phase)).toEqual(['mount', 'scroll', 'filter', 'sort', 'update', 'select', 'unmount'])
    for (const phase of analysis.phases.filter((phase: { phase: string }) => phase.phase !== 'scroll'))
      expect(phase.duration).toBeCloseTo(result.phases[phase.phase], 1)
  }
  const browser = await chromium.launch()
  try {
    const page = await browser.newPage()
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(pathToFileURL(join(output, 'flamecharts.html')).href)
    await expect(page.getByRole('heading', { name: 'Benchmark CPU flamecharts' })).toBeVisible()
    await page.getByRole('combobox').first().selectOption('1')
    await expect(page.getByRole('link', { name: 'cpuprofile', exact: true })).toHaveAttribute('href', `${manifest.captures[1].id}.cpuprofile`)
    await page.getByRole('combobox').nth(1).selectOption('1')
    const range = page.getByLabel('Visible time range')
    const initialRange = await range.textContent()
    await page.locator('canvas').hover({ position: { x: 400, y: 100 } })
    await page.mouse.wheel(0, -300)
    await expect(range).not.toHaveText(initialRange!)
    const zoomedRange = await range.textContent()
    await page.locator('canvas').focus()
    await page.keyboard.press('ArrowRight')
    await expect(range).not.toHaveText(zoomedRange!)
    await page.keyboard.press('Home')
    await expect(range).toHaveText(initialRange!)
    expect(errors).toEqual([])
  }
  finally { await browser.close() }
})

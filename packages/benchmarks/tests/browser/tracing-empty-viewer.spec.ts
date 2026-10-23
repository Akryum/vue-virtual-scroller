import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { expect, test } from '@playwright/test'
import { writeViewer } from '../../scripts/tracing/viewer.mjs'

// Preflight: real generated zero-capture HTML must accept native wheel/keyboard
// input after failure/cancellation. No synthetic chart or handler substitutions.
test('empty trace viewer remains usable without a selected phase', async ({ page }) => {
  const output = await mkdtemp(join(tmpdir(), 'vvs-empty-viewer-'))
  try {
    await writeViewer(output, [])
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(pathToFileURL(join(output, 'flamecharts.html')).href)
    await expect(page.getByRole('heading', { name: 'Benchmark CPU flamecharts' })).toBeVisible()
    const chart = page.locator('canvas')
    await chart.hover({ position: { x: 20, y: 20 } })
    await page.mouse.wheel(0, -300)
    await chart.focus()
    for (const key of ['ArrowRight', 'ArrowLeft', 'Home'])
      await page.keyboard.press(key)
    await page.evaluate(() => new Promise(requestAnimationFrame))
    expect(errors).toEqual([])
    await expect(page.getByRole('combobox', { name: 'Capture', exact: true })).toBeDisabled()
    await expect(page.getByRole('combobox', { name: 'Phase', exact: true })).toBeDisabled()
    await expect(page.getByRole('button', { name: 'Reset zoom' })).toBeDisabled()
    await expect(page.getByLabel('Visible time range')).toHaveText('No valid captures.')
  }
  finally { await rm(output, { recursive: true, force: true }) }
})

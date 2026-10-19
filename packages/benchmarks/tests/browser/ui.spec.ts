import { Buffer } from 'node:buffer'
import { expect, test } from '@playwright/test'

test.setTimeout(30_000)

test('keyboard preview and repeated preview navigation use current configuration', async ({ page }) => {
  await page.goto('/')
  await page.getByLabel('Items', { exact: true }).fill('300')
  await page.getByRole('button', { name: 'Preview', exact: true }).focus()
  await page.keyboard.press('Enter')
  const frame = page.frameLocator('iframe')
  await expect(frame.locator('[data-record][data-id="1"]')).toBeVisible()
  await page.getByRole('combobox', { name: 'Mode', exact: true }).selectOption('plain')
  await page.getByRole('button', { name: 'Preview', exact: true }).click()
  await expect(frame.locator('[data-record]')).toHaveCount(300)
  await page.getByRole('combobox', { name: 'Workload', exact: true }).selectOption('product-grid')
  await page.getByRole('button', { name: 'Preview', exact: true }).click()
  await expect(frame.getByRole('button', { name: 'Add to selection' }).first()).toBeVisible()
})

test('cancel prevents stale results and subsequent preview still works', async ({ page }) => {
  await page.goto('/')
  await page.getByLabel('Items', { exact: true }).fill('100')
  await page.getByLabel('Paired trials', { exact: true }).fill('1')
  await page.getByRole('button', { name: 'Run comparison' }).click()
  await expect(page.getByRole('status')).toContainText('Warm-up')
  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  await expect(page.getByRole('status')).toHaveText('Cancelled')
  await expect(page.getByLabel('Benchmark results')).toContainText('cancelled')
  await page.getByRole('button', { name: 'Preview', exact: true }).click()
  await expect(page.frameLocator('iframe').locator('[data-record][data-id="1"]')).toBeVisible()
})

test('imports CLI report and exports shareable Markdown', async ({ page }) => {
  await page.goto('/')
  const report = { schemaVersion: 1, status: 'complete', metadata: { browser: 'firefox', seed: 2026 }, trials: [
    { browser: 'firefox', workload: 'issue-inbox', mode: 'virtual', count: 1000, valid: true, warmup: false, pair: 0, phases: { mount: 12 }, frames: [], checkpoints: [] },
  ] }
  const malformed = { ...report, trials: [{ ...report.trials[0], frames: 'invalid' }] }
  await page.getByLabel('Import report').setInputFiles({ name: 'invalid.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(malformed)) })
  await expect(page.getByRole('alert')).toContainText('Invalid benchmark report')
  await page.getByLabel('Import report').setInputFiles({ name: 'report.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(report)) })
  await expect(page.getByRole('alert')).toHaveCount(0)
  await expect(page.getByLabel('Benchmark results')).toContainText('12.00')
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export Markdown' }).click()
  expect((await download).suggestedFilename()).toBe('report.md')
})

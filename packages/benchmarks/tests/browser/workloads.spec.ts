import { expect, test } from '@playwright/test'
import { WORKLOADS } from '../../workloads/registry'
import { openCase } from './support'

for (const workload of WORKLOADS) {
  for (const mode of ['virtual', 'plain'] as const) {
    test(`${workload.id} ${mode}: real actions, visible content, and DOM bounds`, async ({ page }, testInfo) => {
      const errors: string[] = []
      page.on('pageerror', error => errors.push(error.message))
      await openCase(page, { workload: workload.id, mode, count: 1000 })
      const initial = await page.evaluate(() => window.benchmark!.inspect())
      if (mode === 'virtual')
        await page.screenshot({ path: testInfo.outputPath(`${workload.id}.png`) })
      expect(initial.visible[0].id).toBe(1)
      expect(initial.visible[0].text.length).toBeGreaterThan(10)
      if (mode === 'plain')
        expect(initial.rendered).toBe(initial.total)
      else expect(initial.rendered).toBeLessThan(200)
      const result = await page.evaluate(() => window.benchmark!.run())
      expect(result.error).toBeUndefined()
      expect(result.valid).toBe(true)
      expect(Object.keys(result.phases)).toEqual(['mount', ...workload.actions, 'unmount'])
      expect(result.frames.length).toBeGreaterThan(10)
      expect(result.checkpoints.find(point => point.phase === 'filter')?.total ?? initial.total).toBeLessThanOrEqual(initial.total)
      expect(await page.locator('[data-record]').count()).toBe(0)
      expect(errors).toEqual([])
    })
  }
}

test('selection survives distant recycling and affects only chosen issue', async ({ page }) => {
  await openCase(page)
  await page.getByRole('checkbox', { name: 'Select issue 1', exact: true }).check()
  await page.locator('[data-viewport]').evaluate(element => element.scrollTop = 50_000)
  await expect(page.locator('[data-record][data-id="1"]')).not.toBeVisible()
  await page.locator('[data-viewport]').evaluate(element => element.scrollTop = 0)
  await expect(page.getByRole('checkbox', { name: 'Select issue 1', exact: true })).toBeChecked()
  await expect(page.getByRole('checkbox', { name: 'Select issue 2', exact: true })).not.toBeChecked()
  await page.evaluate(() => window.benchmark!.execute('sort'))
  await expect(page.getByRole('checkbox', { name: 'Select issue 1', exact: true })).toBeChecked()
  await expect(page.getByRole('checkbox', { name: 'Select issue 5', exact: true })).not.toBeChecked()
})

test('160x160 sparse matrix reaches both axes without raising rendered-item guard', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await openCase(page, { workload: 'inventory-matrix', count: 25600 })
  await page.locator('[data-viewport]').hover()
  await page.mouse.wheel(5000, 9000)
  await expect.poll(() => page.locator('[data-viewport]').evaluate(element => element.scrollLeft)).toBeGreaterThan(0)
  await expect.poll(() => page.locator('[data-viewport]').evaluate(element => element.scrollTop)).toBeGreaterThan(0)
  await expect.poll(async () => (await page.evaluate(() => window.benchmark!.inspect())).visible[0]?.id ?? 0).toBeGreaterThan(1)
  await page.evaluate(() => window.benchmark!.execute('jump'))
  await page.evaluate(() => window.benchmark!.verify('jump'))
  const checkpoint = await page.evaluate(() => window.benchmark!.inspect())
  expect(checkpoint.rendered).toBeLessThan(300)
  expect(checkpoint.visible.some(row => row.id === 17921)).toBe(true)
  expect(errors).toEqual([])
})

test('real wheel input advances horizontal cards and window document', async ({ page }) => {
  await openCase(page, { workload: 'horizontal-cards' })
  await page.locator('[data-viewport]').hover()
  await page.mouse.wheel(1800, 0)
  await expect.poll(() => page.locator('[data-viewport]').evaluate(element => element.scrollLeft)).toBeGreaterThan(0)
  await expect.poll(async () => (await page.evaluate(() => window.benchmark!.inspect())).visible[0]?.id ?? 0).toBeGreaterThan(1)
  await openCase(page, { workload: 'window-feed' })
  await page.mouse.wheel(0, 1500)
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0)
  await expect.poll(async () => (await page.evaluate(() => window.benchmark!.inspect())).visible[0]?.id ?? 0).toBeGreaterThan(1)
})

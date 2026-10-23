import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'
import { openCase } from './support'

/** Header labels must identify the cell's real product/warehouse after native scrolling. */
async function expectCellHeaders(page: Page, id: number, row: number, column: number, product: string) {
  await expect.poll(() => page.evaluate(({ id, row, column }) => {
    const cell = document.querySelector<HTMLElement>(`[data-record][data-id="${id}"]`)
    const productHeader = document.querySelectorAll<HTMLElement>('.matrix-rows span')[row]
    const warehouseHeader = document.querySelectorAll<HTMLElement>('.matrix-columns span')[column]
    if (!cell || !productHeader || !warehouseHeader)
      return false
    const box = cell.getBoundingClientRect()
    return Math.abs(productHeader.getBoundingClientRect().top - box.top) <= 1
      && Math.abs(warehouseHeader.getBoundingClientRect().left - box.left) <= 1
  }, { id, row, column })).toBe(true)
  await expect(page.locator('.matrix-rows span').nth(row)).toContainText(product)
  await expect(page.locator('.matrix-columns span').nth(column)).toHaveText(`Warehouse ${column + 1}`)
}

// Boundary: actual production Vue/library/native scrolling, no mocks. Distinct row/column
// offsets reject stale header synchronization; sort and reset reject stale identity/order.
// Repeated product titles require independently known stock to reject wrong detail IDs.
for (const mode of ['virtual', 'plain'] as const) {
  test(`inventory-matrix ${mode}: headers follow diagonal scrolling, sorting and reset`, async ({ page }) => {
    await openCase(page, { workload: 'inventory-matrix', mode, count: 1000 })
    await expectCellHeaders(page, 1, 0, 0, 'Studio mechanical keyboard')
    await page.locator('[data-viewport]').evaluate(element => element.scrollTo(350, 264))
    await expect.poll(async () => (await page.evaluate(() => window.benchmark!.inspect())).visible[0]?.id).toBe(99)
    await expectCellHeaders(page, 99, 3, 2, 'Wireless conference headset')
    await expect(page.locator('.matrix-rows span').nth(3)).toContainText('Product 4 · row 4')
    await page.locator('[data-record][data-id="99"]').click()
    const details = page.getByLabel('Inventory details')
    await expect(details).toContainText('Wireless conference headset · Warehouse 3')
    await expect(details.locator('p')).toHaveText('296 available units')
    await expect(page.locator('[data-record][data-id="100"] strong')).toHaveText('159 units')
    await page.getByRole('button', { name: 'Close details', exact: true }).click()
    await page.evaluate(() => window.benchmark!.reset())
    await page.evaluate(() => window.benchmark!.execute('sort'))
    // Seed 2026's highest-stock product row is original row 27, beginning at ID 833.
    await expect.poll(async () => (await page.evaluate(() => window.benchmark!.inspect())).visible[0]?.id).toBe(833)
    await expectCellHeaders(page, 833, 0, 0, 'Adjustable desk lamp')
    await expect(page.locator('.matrix-rows span').first()).toContainText('Product 27 · row 1')
    await page.locator('[data-viewport]').evaluate(element => element.scrollTo(350, 264))
    await page.evaluate(() => window.benchmark!.reset())
    await expect.poll(async () => (await page.evaluate(() => window.benchmark!.inspect())).visible[0]?.id).toBe(1)
    await expectCellHeaders(page, 1, 0, 0, 'Studio mechanical keyboard')
  })
}

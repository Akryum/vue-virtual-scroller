import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'
import { openCase } from './support'

/** Real native auto layout is the oracle; cloned rows retain actual content and CSS. */
async function columnGeometry(page: Page) {
  return page.locator('table').evaluate((table: HTMLTableElement) => {
    const native = table.cloneNode(true) as HTMLTableElement
    native.querySelector('colgroup')?.remove()
    Object.assign(native.style, { tableLayout: 'auto', position: 'absolute', visibility: 'hidden', top: '0', left: '-20000px', width: `${table.getBoundingClientRect().width}px` })
    table.parentElement!.append(native)
    try {
      return {
        locked: Array.from(table.querySelectorAll('col'), col => Number.parseFloat(col.style.width)),
        native: Array.from(native.tHead!.rows[0].cells, cell => Math.ceil(cell.getBoundingClientRect().width)),
      }
    }
    finally {
      native.remove()
    }
  })
}

/** Matching columns and nonoverlapping visible rows protect usable semantic table layout. */
async function expectAligned(page: Page) {
  await expect.poll(() => page.locator('table').evaluate((table: HTMLTableElement) => {
    const header = Array.from(table.tHead!.rows[0].cells, cell => cell.getBoundingClientRect())
    const viewport = table.parentElement!.getBoundingClientRect()
    const rows = [...table.querySelectorAll<HTMLTableRowElement>('[data-record]')]
      .filter(row => getComputedStyle(row).visibility !== 'hidden')
      .map(row => ({ box: row.getBoundingClientRect(), cells: Array.from(row.cells, cell => cell.getBoundingClientRect()) }))
      .filter(row => row.box.bottom > header[0].bottom && row.box.top < viewport.bottom)
      .sort((a, b) => a.box.top - b.box.top)
    return rows.length > 0 && rows.every((row, index) => row.cells.every((cell, column) =>
      Math.abs(cell.left - header[column].left) <= 1 && Math.abs(cell.right - header[column].right) <= 1)
    && (index === 0 || row.box.top >= rows[index - 1].box.bottom - 1))
  })).toBe(true)
}

for (const mode of ['virtual', 'plain'] as const) {
  test(`customer-table ${mode}: filter, sort, update and resize preserve content and columns`, async ({ page }) => {
    await openCase(page, { workload: 'customer-table', mode, count: 101 })
    await expectAligned(page)
    await page.evaluate(() => window.benchmark!.execute('filter'))
    await page.evaluate(() => window.benchmark!.verify('filter'))
    const filtered = await page.locator('[data-record]').evaluateAll(rows => rows
      .filter(row => getComputedStyle(row).visibility !== 'hidden' && row.getBoundingClientRect().height > 0)
      .map(row => ({ id: Number((row as HTMLElement).dataset.id), group: (row as HTMLElement).dataset.group })))
    const expectedIds = Array.from({ length: 34 }, (_, index) => index * 3 + 1)
    expect(filtered.every(row => row.group === 'Europe' && expectedIds.includes(row.id))).toBe(true)
    if (mode === 'plain')
      expect(filtered.map(row => row.id)).toEqual(expectedIds)
    await expectAligned(page)
    await page.evaluate(() => window.benchmark!.reset())
    await page.evaluate(() => window.benchmark!.execute('sort'))
    // Sorting can retain a scroll anchor; inspect the start of the sorted dataset.
    await page.locator('[data-viewport]').evaluate(element => element.scrollTop = 0)
    // Seed 2026 fixture: account 58 has $912, ahead of account 22 at $898.
    await expect.poll(async () => (await page.evaluate(() => window.benchmark!.inspect())).visible[0]?.id ?? null).toBe(58)
    await expectAligned(page)
    await page.evaluate(() => window.benchmark!.reset())
    await page.evaluate(() => window.benchmark!.execute('update'))
    await expect(page.locator('[data-record][data-id="1"]')).toContainText('Northstar Studio account review · reviewed')
    await expect(page.locator('[data-record][data-id="1"]')).toContainText('Customer support reproduced this during the morning handover. Keep the existing draft and show a clear recovery action when the connection returns. Review completed by the account owner.')
    await expectAligned(page)
    await page.evaluate(() => window.benchmark!.execute('resize'))
    await expect.poll(() => page.locator('[data-viewport]').evaluate(element => element.getBoundingClientRect().width)).toBe(720)
    await expectAligned(page)
    await page.locator('[data-viewport]').evaluate(element => element.scrollTop = element.scrollHeight)
    await expect(page.locator('[data-record][data-id="101"]')).toContainText('Cinder Cloud account review')
    await expect(page.locator('[data-record][data-id="101"]')).toHaveAttribute('data-version', '0')
    const count = await page.locator('[data-record]').count()
    expect(mode === 'plain' ? count === 101 : count < 80).toBe(true)
  })

  test(`customer-table ${mode}: content revision follows native column growth; selection and recycling keep widths`, async ({ page }) => {
    await page.goto(`/table-width-policy.html?mode=${mode}`)
    await expect.poll(async () => (await columnGeometry(page)).locked.length).toBe(6)
    await expectAligned(page)
    const before = await columnGeometry(page)
    await expect(page.locator('[data-record][data-id="1"]')).toContainText('$99,999,999')
    await page.getByRole('checkbox', { name: 'Select account 1', exact: true }).check()
    await expect(page.getByRole('checkbox', { name: 'Select account 2', exact: true })).not.toBeChecked()
    expect((await columnGeometry(page)).locked).toEqual(before.locked)
    await page.locator('[data-viewport]').hover()
    await page.mouse.wheel(0, 4000)
    await expect.poll(() => page.locator('[data-viewport]').evaluate(element => element.scrollTop)).toBeGreaterThan(0)
    await expect(page.locator('[data-record][data-id="1"]')).not.toBeInViewport()
    expect((await columnGeometry(page)).locked).toEqual(before.locked)
    await page.locator('[data-viewport]').evaluate(element => element.scrollTop = element.scrollHeight)
    await expect(page.locator('[data-record][data-id="101"]')).toBeVisible()
    await expect(page.locator('[data-record][data-id="101"]')).toContainText('$10')
    await page.locator('[data-viewport]').evaluate(element => element.scrollTop = 0)
    await expect(page.getByRole('checkbox', { name: 'Select account 1', exact: true })).toBeChecked()
    await page.getByRole('button', { name: 'Update accounts', exact: true }).click()
    await expect(page.locator('[data-record][data-id="1"]')).toContainText('$100,000,000')
    await expect(page.locator('[data-record][data-id="1"]')).toContainText('Account 1 · reviewed')
    await expect(page.locator('[data-record][data-id="1"]')).toContainText('Review pending. Review completed by the account owner.')
    // A stale lock still aligns header/body, so compare against independent native sizing.
    await expect.poll(async () => {
      const after = await columnGeometry(page)
      return after.native[4] - before.native[4]
    }, { message: 'Revenue fixture must grow native column width' }).toBeGreaterThan(1)
    await expect.poll(async () => {
      const after = await columnGeometry(page)
      return after.locked.length === 6
        ? Math.max(...after.locked.map((width, index) => Math.abs(width - after.native[index])))
        : Number.POSITIVE_INFINITY
    }, { message: 'Content update must replace stale column locks with native widths' }).toBeLessThanOrEqual(1)
    await expectAligned(page)
    await page.locator('[data-viewport]').evaluate(element => element.scrollTop = element.scrollHeight)
    await expect(page.locator('[data-record][data-id="101"]')).toContainText('Review pending.')
    await expect(page.locator('[data-record][data-id="101"]')).not.toContainText('reviewed')
    await expect(page.locator('[data-record][data-id="101"]')).toHaveAttribute('data-version', '0')
    await expect(page.locator('[data-record][data-id="101"]')).toContainText('$10')
  })
}

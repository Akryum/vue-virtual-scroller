import { expect, test } from '@playwright/test'
import {
  control,
  expectDemoSmoke,
  getVisibleItems,
  metric,
  scrollViewportBy,
  waitForAnimationFrame,
  waitForSettle,
} from './support/demo'

interface VisibleRowSnapshot {
  end: number
  id: number
  start: number
}

/**
 * Read the first visible rows inside the demo viewport.
 */
async function getVisibleRowSnapshot(page: Parameters<typeof test>[0]['page']) {
  const rows = await getVisibleItems(page, '[data-testid="demo:row"]')
  return rows
    .map((row) => {
      const id = Number(row.key)
      if (!Number.isFinite(id)) {
        return null
      }

      return {
        id,
        start: row.start,
        end: row.end,
      }
    })
    .filter((row): row is VisibleRowSnapshot => row != null)
    .slice(0, 5)
}

/**
 * Assert that the same visible rows stayed anchored within a geometry tolerance.
 */
function expectAnchoredRows(
  beforeRows: VisibleRowSnapshot[],
  afterRows: VisibleRowSnapshot[],
  tolerance: number,
) {
  expect(afterRows.length).toBeGreaterThanOrEqual(beforeRows.length)

  for (let index = 0; index < beforeRows.length; index++) {
    const before = beforeRows[index]
    const after = afterRows[index]
    expect(after.id).toBe(before.id)
    expect(Math.abs(after.start - before.start)).toBeLessThanOrEqual(tolerance)
    expect(Math.abs(after.end - before.end)).toBeLessThanOrEqual(tolerance)
  }
}

/**
 * Poll for anchored rows across a few animation frames to absorb CI jitter.
 */
async function expectAnchoredRowsEventually(
  page: Parameters<typeof test>[0]['page'],
  beforeRows: VisibleRowSnapshot[],
  tolerance: number,
  attempts = 6,
) {
  let lastError: unknown

  for (let attempt = 0; attempt < attempts; attempt++) {
    const afterRows = await getVisibleRowSnapshot(page)

    try {
      expectAnchoredRows(beforeRows, afterRows, tolerance)
      return afterRows
    }
    catch (error) {
      lastError = error
      await waitForAnimationFrame(page)
    }
  }

  throw lastError
}

test('shift demo smoke', async ({ page }) => {
  await expectDemoSmoke(page, {
    slug: 'shift',
    itemSelector: '[data-testid="demo:row"]',
  })
})

test('shift demo keeps the viewport visually anchored after prepend', async ({ browserName, page }) => {
  test.skip(browserName !== 'chromium')

  await page.goto('/demos/shift')

  const topRowMetric = metric(page, 'top-row')
  await control(page, 'jump-middle').click()
  await waitForSettle(page)
  const topRowBefore = (await topRowMetric.textContent())?.trim()
  expect(topRowBefore).toBeTruthy()
  const beforeRows = await getVisibleRowSnapshot(page)

  await control(page, 'prepend-10').click()
  await expect(metric(page, 'rows')).toHaveText('Loaded rows: 46')
  await expectAnchoredRowsEventually(page, beforeRows, 3, 4)

  await waitForSettle(page)
  const afterRows = await getVisibleRowSnapshot(page)

  await expect(topRowMetric).toHaveText(topRowBefore!)
  expectAnchoredRows(beforeRows, afterRows, 4)
})

test('shift demo keeps anchoring after scrolling upward before prepend', async ({ browserName, page }) => {
  test.skip(browserName !== 'chromium')

  await page.goto('/demos/shift')

  const topRowMetric = metric(page, 'top-row')
  await control(page, 'jump-middle').click()
  await waitForSettle(page)
  await scrollViewportBy(page, -800)
  await waitForSettle(page)

  const topRowBefore = (await topRowMetric.textContent())?.trim()
  expect(topRowBefore).toBeTruthy()
  const beforeRows = await getVisibleRowSnapshot(page)

  await control(page, 'prepend-10').click()
  await expect(metric(page, 'rows')).toHaveText('Loaded rows: 46')
  await expectAnchoredRowsEventually(page, beforeRows, 32, 12)

  await waitForSettle(page, 16)
  const afterRows = await getVisibleRowSnapshot(page)

  await expect(topRowMetric).toHaveText(topRowBefore!)
  expectAnchoredRows(beforeRows, afterRows, 32)
})

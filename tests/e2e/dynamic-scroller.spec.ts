import { expect, test } from '@playwright/test'
import {
  control,
  expectDemoSmoke,
  getVisibleItems,
  metric,
  readMetricNumbers,
  scrollViewportBy,
  waitForSettle,
} from './support/demo'

interface VisibleRowMetric {
  end: number
  id: number
  start: number
}

function normalizeVisibleRows(rows: Awaited<ReturnType<typeof getVisibleItems>>): VisibleRowMetric[] {
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
    .filter((row): row is VisibleRowMetric => row != null)
}

function expectContiguousVisibleRows(rows: VisibleRowMetric[]) {
  expect(rows.length).toBeGreaterThan(3)

  for (let index = 1; index < rows.length; index++) {
    const previous = rows[index - 1]
    const current = rows[index]
    const gap = current.start - previous.end

    expect(current.id).toBe(previous.id + 1)
    expect(current.start).toBeGreaterThanOrEqual(previous.start - 1)
    expect(Math.abs(gap)).toBeLessThanOrEqual(8)
    expect(current.end - current.start).toBeGreaterThan(0)
  }
}

test('dynamic scroller demo smoke', async ({ page }) => {
  await expectDemoSmoke(page, {
    slug: 'dynamic-scroller',
    itemSelector: '[data-testid="demo:row"]',
  })
})

test('dynamic scroller demo keeps visible rows contiguous after fast scrolling', async ({ browserName, page }) => {
  test.skip(browserName !== 'chromium')

  await page.goto('/demos/dynamic-scroller')
  await waitForSettle(page)

  for (const distance of [0, 1800, 4200, -2600, 5600]) {
    await scrollViewportBy(page, distance)
    await waitForSettle(page)

    const visibleRows = normalizeVisibleRows(await getVisibleItems(page, '[data-testid="demo:row"]'))
    expectContiguousVisibleRows(visibleRows)
  }
})

test('dynamic scroller demo filters, remeasures, and updates the visible range', async ({ browserName, page }) => {
  test.skip(browserName !== 'chromium')

  await page.goto('/demos/dynamic-scroller')

  const matchesMetric = metric(page, 'matches')
  const visibleMetric = metric(page, 'visible-range')
  const initialMatches = (await readMetricNumbers(matchesMetric))[0] ?? 0
  const row = page.locator('[data-testid="demo:row"]:visible').first()
  const initialText = await row.locator('.demo-message-meta').first().textContent()
  const filterTerm = initialText?.split(' ').find(Boolean) ?? 'Avery'

  await control(page, 'filter').fill(filterTerm)
  await waitForSettle(page)
  expect((await readMetricNumbers(matchesMetric))[0] ?? 0).toBeLessThan(initialMatches)

  const beforeMutation = (await row.textContent()) ?? ''
  await row.click()
  await waitForSettle(page)
  expect(await row.textContent()).not.toBe(beforeMutation)

  await control(page, 'filter').fill('')
  await waitForSettle(page)
  const visibleBefore = await readMetricNumbers(visibleMetric)
  const rowsBefore = await getVisibleItems(page, '[data-testid="demo:row"]')

  await scrollViewportBy(page, 1800)
  await waitForSettle(page)

  const visibleAfter = await readMetricNumbers(visibleMetric)
  const rowsAfter = await getVisibleItems(page, '[data-testid="demo:row"]')

  expect(visibleAfter).not.toEqual(visibleBefore)
  expect(rowsAfter.map(rowItem => rowItem.key)).not.toEqual(rowsBefore.map(rowItem => rowItem.key))
})

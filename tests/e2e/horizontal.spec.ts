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

function getWidths(rows: Awaited<ReturnType<typeof getVisibleItems>>) {
  return rows.map(row => row.end - row.start)
}

test('horizontal demo smoke', async ({ page }) => {
  await expectDemoSmoke(page, {
    slug: 'horizontal',
    axis: 'horizontal',
    itemSelector: '[data-testid="demo:card"]',
  })
})

test('horizontal demo scrolls and filters dynamic cards', async ({ browserName, page }) => {
  test.skip(browserName !== 'chromium')

  await page.goto('/demos/horizontal')
  await waitForSettle(page)

  const cardsMetric = metric(page, 'cards')
  const before = await getVisibleItems(page, '[data-testid="demo:card"]', 'horizontal')
  expect(before.length).toBeGreaterThan(1)
  expect(getWidths(before).every(width => width > 0)).toBe(true)

  await scrollViewportBy(page, 1600, 'horizontal')
  await waitForSettle(page)

  const after = await getVisibleItems(page, '[data-testid="demo:card"]', 'horizontal')
  expect(after.length).toBeGreaterThan(1)
  expect(getWidths(after).every(width => width > 0)).toBe(true)
  expect(after.map(card => card.key)).not.toEqual(before.map(card => card.key))

  const filterTerm = ((await page.locator('[data-testid="demo:card"] .demo-message-meta').first().textContent()) ?? '').split(' ').find(Boolean) ?? 'Avery'
  const initialCount = (await readMetricNumbers(cardsMetric))[0] ?? 0
  await control(page, 'filter').fill(filterTerm)
  await waitForSettle(page)

  expect((await readMetricNumbers(cardsMetric))[0] ?? 0).toBeLessThanOrEqual(initialCount)
  expect((await getVisibleItems(page, '[data-testid="demo:card"]', 'horizontal')).length).toBeGreaterThan(0)
})

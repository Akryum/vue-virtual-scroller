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

test('simple list demo smoke', async ({ page }) => {
  await expectDemoSmoke(page, {
    slug: 'simple-list',
    itemSelector: '[data-testid="demo:row"]',
  })
})

test('simple list demo filters and toggles between dynamic and fixed modes', async ({ browserName, page }) => {
  test.skip(browserName !== 'chromium')

  await page.goto('/demos/simple-list')

  const rowsMetric = metric(page, 'rows')
  const initialRows = (await readMetricNumbers(rowsMetric))[0] ?? 0
  const filterTerm = ((await page.locator('[data-testid="demo:row"] .demo-message-body').first().textContent()) ?? '').split(' ').find(Boolean) ?? 'virtual'

  await control(page, 'filter').fill(filterTerm)
  await waitForSettle(page)
  expect((await readMetricNumbers(rowsMetric))[0] ?? 0).toBeLessThan(initialRows)

  await control(page, 'dynamic-mode').click()
  await waitForSettle(page)

  const beforeScroll = await getVisibleItems(page, '[data-testid="demo:row"]')
  expect(beforeScroll.length).toBeGreaterThan(0)

  await scrollViewportBy(page, 900)
  await waitForSettle(page)

  const afterScroll = await getVisibleItems(page, '[data-testid="demo:row"]')
  expect(afterScroll.map(row => row.key)).not.toEqual(beforeScroll.map(row => row.key))
})

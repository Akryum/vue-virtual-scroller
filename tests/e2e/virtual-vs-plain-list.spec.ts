import { expect, test } from '@playwright/test'
import {
  control,
  expectDemoSmoke,
  getVisibleItems,
  gotoDemo,
  metric,
  readMetricNumbers,
  scrollViewportBy,
  waitForSettle,
} from './support/demo'

test('virtual vs plain list demo smoke', async ({ page }) => {
  await expectDemoSmoke(page, {
    slug: 'virtual-vs-plain-list',
    itemSelector: '[data-testid="demo:row"]',
  })
})

test('virtual vs plain list toggles rendered row count', async ({ browserName, page }) => {
  test.skip(browserName !== 'chromium')

  await gotoDemo(page, 'virtual-vs-plain-list')

  const totalRowsMetric = metric(page, 'rows')
  const renderedRowsMetric = metric(page, 'rendered-rows')
  const totalRows = (await readMetricNumbers(totalRowsMetric))[0] ?? 0
  const initialRenderedRows = (await readMetricNumbers(renderedRowsMetric))[0] ?? 0

  expect(initialRenderedRows).toBeGreaterThan(0)
  expect(initialRenderedRows).toBeLessThan(totalRows)

  const beforeScroll = await getVisibleItems(page, '[data-testid="demo:row"]')
  expect(beforeScroll.length).toBeGreaterThan(0)

  await scrollViewportBy(page, 1200)
  await waitForSettle(page)

  const afterScroll = await getVisibleItems(page, '[data-testid="demo:row"]')
  expect(afterScroll.map(row => row.key)).not.toEqual(beforeScroll.map(row => row.key))

  await control(page, 'virtual-mode').click()
  await waitForSettle(page)

  const renderedRowsInPlainMode = (await readMetricNumbers(renderedRowsMetric))[0] ?? 0
  expect(renderedRowsInPlainMode).toBe(totalRows)
})

import { expect, test } from '@playwright/test'
import {
  control,
  expectDemoSmoke,
  getViewportEdgeDistance,
  metric,
  readMetricNumbers,
  viewport,
  waitForSettle,
} from './support/demo'

test('chat demo smoke', async ({ page }) => {
  await expectDemoSmoke(page, {
    slug: 'chat',
    itemSelector: '[data-testid="demo:row"]',
  })
})

test('chat demo streams, filters, and stays pinned near the bottom', async ({ browserName, page }) => {
  test.skip(browserName !== 'chromium')

  await page.goto('/demos/chat')

  const rowsMetric = metric(page, 'rows')
  const initialRows = (await readMetricNumbers(rowsMetric))[0] ?? 0

  await control(page, 'start-stream').click()
  await expect.poll(async () => (await readMetricNumbers(rowsMetric))[0] ?? 0).toBeGreaterThan(initialRows)

  const startedRows = (await readMetricNumbers(rowsMetric))[0] ?? 0
  await control(page, 'stop-stream').click()
  await page.waitForTimeout(700)
  expect((await readMetricNumbers(rowsMetric))[0] ?? 0).toBe(startedRows)

  await control(page, 'append-20').click()
  await waitForSettle(page)
  expect((await readMetricNumbers(rowsMetric))[0] ?? 0).toBeGreaterThanOrEqual(startedRows + 20)
  expect(await getViewportEdgeDistance(page)).toBeLessThan(140)

  const firstRowText = await page.locator('[data-testid="demo:row"] strong').first().textContent()
  const filterTerm = firstRowText?.split(' ').find(Boolean) ?? 'Avery'
  await control(page, 'filter').fill(filterTerm)
  await waitForSettle(page)

  expect((await readMetricNumbers(rowsMetric))[0] ?? 0).toBeLessThanOrEqual(startedRows + 20)
  await expect(viewport(page)).toBeVisible()
})

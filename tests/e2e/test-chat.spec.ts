import { expect, test } from '@playwright/test'
import {
  control,
  getViewportEdgeDistance,
  gotoDemo,
  metric,
  readMetricNumbers,
  viewport,
  waitForSettle,
} from './support/demo'

test('test chat demo smoke', async ({ page }) => {
  await gotoDemo(page, 'test-chat')
  await control(page, 'add-80').click()
  await waitForSettle(page)

  expect((await readMetricNumbers(metric(page, 'messages')))[0] ?? 0).toBe(80)
  await expect(viewport(page)).toBeVisible()
  await expect(page.locator('[data-testid="demo:row"]:visible').first()).toBeVisible()
})

test('test chat demo handles repeated append bursts while staying pinned to the end', async ({ browserName, page }) => {
  test.skip(browserName !== 'chromium')

  await page.goto('/demos/test-chat')

  await control(page, 'add-20').click()
  await control(page, 'add-80').click()
  await waitForSettle(page)
  expect((await readMetricNumbers(metric(page, 'messages')))[0] ?? 0).toBe(100)
  expect(await getViewportEdgeDistance(page)).toBeLessThan(120)

  await control(page, 'add-1').click()
  await waitForSettle(page)
  expect((await readMetricNumbers(metric(page, 'messages')))[0] ?? 0).toBe(101)
})

import { expect, test } from '@playwright/test'
import {
  control,
  expectDemoSmoke,
  getVisibleItems,
  metric,
  readMetricNumbers,
  setControlValue,
  waitForSettle,
} from './support/demo'

test('recycle scroller demo smoke', async ({ page }) => {
  await expectDemoSmoke(page, {
    slug: 'recycle-scroller',
    itemSelector: '[data-testid="demo:row"]',
  })
})

test('recycle scroller jumps and remains usable after adding items', async ({ browserName, page }) => {
  test.skip(browserName !== 'chromium')

  await page.goto('/demos/recycle-scroller')

  await setControlValue(control(page, 'scroll-to'), 180)
  await control(page, 'jump').click()
  await waitForSettle(page)

  expect((await readMetricNumbers(metric(page, 'visible-range')))[0] ?? 0).toBeGreaterThan(100)

  const beforeAdd = await getVisibleItems(page, '[data-testid="demo:row"]')
  await control(page, 'add-500').click()
  await setControlValue(control(page, 'scroll-to'), 680)
  await control(page, 'jump').click()
  await waitForSettle(page)

  const afterAdd = await getVisibleItems(page, '[data-testid="demo:row"]')
  expect(afterAdd.length).toBeGreaterThan(2)
  expect(afterAdd.map(row => row.key)).not.toEqual(beforeAdd.map(row => row.key))
  expect((await readMetricNumbers(metric(page, 'visible-range')))[0] ?? 0).toBeGreaterThan(600)
})

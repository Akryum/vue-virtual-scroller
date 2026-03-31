import { expect, test } from '@playwright/test'
import {
  control,
  expectDemoSmoke,
  getVisibleItems,
  metric,
  readMetricNumbers,
  scrollViewportBy,
  setControlValue,
  waitForSettle,
} from './support/demo'

test('grid demo smoke', async ({ page }) => {
  await expectDemoSmoke(page, {
    slug: 'grid',
    itemSelector: '[data-testid="demo:card"]',
  })
})

test('grid demo reflows and jumps to the requested region', async ({ browserName, page }) => {
  test.skip(browserName !== 'chromium')

  await page.goto('/demos/grid')

  expect((await readMetricNumbers(metric(page, 'cards')))[0] ?? 0).toBeGreaterThan(1000)

  const beforeCards = await getVisibleItems(page, '[data-testid="demo:card"]')
  const viewportWidth = await page.getByTestId('demo:viewport').evaluate(element => (element as HTMLElement).clientWidth)
  const firstRowTop = beforeCards[0]?.start ?? 0
  const firstRowCards = beforeCards.filter(card => Math.abs(card.start - firstRowTop) < 4)
  expect(Math.max(...firstRowCards.map(card => card.end))).toBeLessThanOrEqual(viewportWidth + 1)

  await setControlValue(control(page, 'grid-items'), 10)
  await waitForSettle(page)

  const leftCards = await getVisibleItems(page, '[data-testid="demo:card"]')
  await scrollViewportBy(page, 360, 'horizontal')
  await waitForSettle(page)

  const rightCards = await getVisibleItems(page, '[data-testid="demo:card"]')
  expect(rightCards.length).toBeGreaterThan(0)
  expect(rightCards.map(card => card.key)).not.toEqual(leftCards.map(card => card.key))

  await setControlValue(control(page, 'grid-items'), 2)
  await waitForSettle(page)

  const afterCards = await getVisibleItems(page, '[data-testid="demo:card"]')
  expect(afterCards.length).toBeLessThan(beforeCards.length)

  await setControlValue(control(page, 'scroll-to'), 320)
  await control(page, 'jump').click()
  await waitForSettle(page)

  const jumpedCards = await getVisibleItems(page, '[data-testid="demo:card"]')
  expect(Number(jumpedCards[0]?.key ?? 0)).toBeGreaterThan(250)
})

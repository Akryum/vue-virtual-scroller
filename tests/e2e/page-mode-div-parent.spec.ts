import { expect, test } from '@playwright/test'
import {
  control,
  expectDemoSmoke,
  getVisibleItems,
  scrollViewportBy,
  waitForSettle,
} from './support/demo'

test('page-mode with div scroll-parent virtualizes against the inner div', async ({ page }) => {
  // Issue #928: confirm the parent div drives virtualization end-to-end.
  await expectDemoSmoke(page, {
    slug: 'page-mode-div-parent',
    itemSelector: '[data-testid="demo:row"]',
  })
})

test('page-mode honors an explicit scrollParent prop', async ({ browserName, page }) => {
  test.skip(browserName !== 'chromium')

  await page.goto('/demos/page-mode-div-parent')
  await waitForSettle(page)

  const before = await getVisibleItems(page, '[data-testid="demo:row"]')
  expect(before.length).toBeGreaterThan(0)

  await control(page, 'use-explicit').click()
  await waitForSettle(page)

  // Toggling to the explicit prop should keep the scroller usable: still
  // renders rows, and scrolling the parent still advances the visible window.
  const afterToggle = await getVisibleItems(page, '[data-testid="demo:row"]')
  expect(afterToggle.length).toBeGreaterThan(0)

  await scrollViewportBy(page, 600)
  await waitForSettle(page)

  const afterScroll = await getVisibleItems(page, '[data-testid="demo:row"]')
  expect(afterScroll.length).toBeGreaterThan(0)
  expect(afterScroll.map(row => row.key)).not.toEqual(afterToggle.map(row => row.key))
})

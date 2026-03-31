import { expect, test } from '@playwright/test'
import {
  control,
  expectDemoSmoke,
  metric,
  scrollViewportBy,
  viewport,
  waitForAnimationFrame,
  waitForSettle,
} from './support/demo'
import { countImageDiffPixels } from './support/image'

const DEFAULT_VISUAL_DIFF_LIMIT = 500
const TOP_EDGE_VISUAL_DIFF_LIMIT = 1500

async function getViewportScreenshot(page: Parameters<typeof test>[0]['page']) {
  await expect(viewport(page)).toBeVisible()
  return viewport(page).screenshot()
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

  const beforeScreenshot = await getViewportScreenshot(page)

  await control(page, 'prepend-10').click()
  await expect(metric(page, 'rows')).toHaveText('Loaded rows: 46')

  const immediateScreenshot = await getViewportScreenshot(page)
  const immediateDiffPixels = await countImageDiffPixels(page, beforeScreenshot, immediateScreenshot)

  await waitForAnimationFrame(page)
  const firstFrameScreenshot = await getViewportScreenshot(page)
  const firstFrameDiffPixels = await countImageDiffPixels(page, beforeScreenshot, firstFrameScreenshot)

  await waitForSettle(page)

  const afterScreenshot = await getViewportScreenshot(page)
  const diffPixels = await countImageDiffPixels(page, beforeScreenshot, afterScreenshot)

  await expect(topRowMetric).toHaveText(topRowBefore!)
  expect(immediateDiffPixels).toBeLessThanOrEqual(DEFAULT_VISUAL_DIFF_LIMIT)
  expect(firstFrameDiffPixels).toBeLessThanOrEqual(DEFAULT_VISUAL_DIFF_LIMIT)
  expect(diffPixels).toBeLessThanOrEqual(DEFAULT_VISUAL_DIFF_LIMIT)
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

  const beforeScreenshot = await getViewportScreenshot(page)

  await control(page, 'prepend-10').click()
  await expect(metric(page, 'rows')).toHaveText('Loaded rows: 46')

  const immediateScreenshot = await getViewportScreenshot(page)
  const immediateDiffPixels = await countImageDiffPixels(page, beforeScreenshot, immediateScreenshot)

  await waitForAnimationFrame(page)
  const firstFrameScreenshot = await getViewportScreenshot(page)
  const firstFrameDiffPixels = await countImageDiffPixels(page, beforeScreenshot, firstFrameScreenshot)

  await waitForSettle(page)

  const afterScreenshot = await getViewportScreenshot(page)
  const diffPixels = await countImageDiffPixels(page, beforeScreenshot, afterScreenshot)

  await expect(topRowMetric).toHaveText(topRowBefore!)
  expect(immediateDiffPixels).toBeLessThanOrEqual(TOP_EDGE_VISUAL_DIFF_LIMIT)
  expect(firstFrameDiffPixels).toBeLessThanOrEqual(TOP_EDGE_VISUAL_DIFF_LIMIT)
  expect(diffPixels).toBeLessThanOrEqual(TOP_EDGE_VISUAL_DIFF_LIMIT)
})

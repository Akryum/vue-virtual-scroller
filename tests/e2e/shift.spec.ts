import type { Buffer } from 'node:buffer'
import { expect, test } from '@playwright/test'

async function waitForSettle(page: Parameters<typeof test>[0]['page']) {
  await page.waitForTimeout(50)
  await page.evaluate(async () => {
    for (let index = 0; index < 10; index++) {
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
    }
  })
}

async function waitForAnimationFrame(page: Parameters<typeof test>[0]['page']) {
  await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => resolve())))
}

async function scrollViewportBy(page: Parameters<typeof test>[0]['page'], delta: number) {
  await page.evaluate((delta) => {
    const viewport = document.querySelector<HTMLElement>('.demo-viewport')
    if (!viewport) {
      throw new Error('Missing demo viewport')
    }
    viewport.scrollTop += delta
    viewport.dispatchEvent(new Event('scroll'))
  }, delta)
}

const DEFAULT_VISUAL_DIFF_LIMIT = 500
const TOP_EDGE_VISUAL_DIFF_LIMIT = 1500

async function getViewportScreenshot(page: Parameters<typeof test>[0]['page']) {
  const viewport = page.locator('.demo-viewport')
  await expect(viewport).toBeVisible()
  return viewport.screenshot()
}

async function countImageDiffPixels(
  page: Parameters<typeof test>[0]['page'],
  before: Buffer,
  after: Buffer,
) {
  return page.evaluate(async ({ beforeBytes, afterBytes }) => {
    async function loadImageData(bytes: number[]) {
      const blob = new Blob([new Uint8Array(bytes)], { type: 'image/png' })
      const bitmap = await createImageBitmap(blob)
      const cropRight = 22
      const cropLeft = 1
      const cropTop = 1
      const cropBottom = 1
      const width = bitmap.width - cropLeft - cropRight
      const height = bitmap.height - cropTop - cropBottom
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const context = canvas.getContext('2d')
      if (!context) {
        throw new Error('2D canvas context unavailable')
      }
      context.drawImage(bitmap, -cropLeft, -cropTop)
      return context.getImageData(0, 0, width, height)
    }

    const beforeImage = await loadImageData(beforeBytes)
    const afterImage = await loadImageData(afterBytes)

    if (beforeImage.width !== afterImage.width || beforeImage.height !== afterImage.height) {
      throw new Error('Screenshot dimensions do not match')
    }

    let diffPixels = 0
    for (let index = 0; index < beforeImage.data.length; index += 4) {
      const red = Math.abs(beforeImage.data[index] - afterImage.data[index])
      const green = Math.abs(beforeImage.data[index + 1] - afterImage.data[index + 1])
      const blue = Math.abs(beforeImage.data[index + 2] - afterImage.data[index + 2])
      const alpha = Math.abs(beforeImage.data[index + 3] - afterImage.data[index + 3])

      if (red > 8 || green > 8 || blue > 8 || alpha > 8) {
        diffPixels++
      }
    }

    return diffPixels
  }, {
    beforeBytes: [...before],
    afterBytes: [...after],
  })
}

test('shift demo keeps the viewport visually anchored after prepend', async ({ page }) => {
  await page.goto('/demos/shift')

  const viewport = page.locator('.demo-viewport')
  const prependButton = page.getByRole('button', { name: 'Prepend 10' })
  const jumpButton = page.getByRole('button', { name: 'Jump to middle' })
  const topRowChip = page.locator('.demo-chip').filter({ hasText: 'Top row:' })
  await expect(viewport).toBeVisible()
  await jumpButton.click()
  await waitForSettle(page)
  const topRowBefore = (await topRowChip.textContent())?.trim()
  expect(topRowBefore).toBeTruthy()

  const beforeScreenshot = await getViewportScreenshot(page)

  await prependButton.click()
  await expect(page.getByText('Rows: 46')).toBeVisible()

  const immediateScreenshot = await getViewportScreenshot(page)
  const immediateDiffPixels = await countImageDiffPixels(page, beforeScreenshot, immediateScreenshot)

  await waitForAnimationFrame(page)
  const firstFrameScreenshot = await getViewportScreenshot(page)
  const firstFrameDiffPixels = await countImageDiffPixels(page, beforeScreenshot, firstFrameScreenshot)

  await waitForSettle(page)

  const afterScreenshot = await getViewportScreenshot(page)
  const diffPixels = await countImageDiffPixels(page, beforeScreenshot, afterScreenshot)

  await expect(topRowChip).toHaveText(topRowBefore!)
  expect(immediateDiffPixels).toBeLessThanOrEqual(DEFAULT_VISUAL_DIFF_LIMIT)
  expect(firstFrameDiffPixels).toBeLessThanOrEqual(DEFAULT_VISUAL_DIFF_LIMIT)
  expect(diffPixels).toBeLessThanOrEqual(DEFAULT_VISUAL_DIFF_LIMIT)
})

test('shift demo keeps anchoring after scrolling upward before prepend', async ({ page }) => {
  await page.goto('/demos/shift')

  const viewport = page.locator('.demo-viewport')
  const prependButton = page.getByRole('button', { name: 'Prepend 10' })
  const jumpButton = page.getByRole('button', { name: 'Jump to middle' })
  const topRowChip = page.locator('.demo-chip').filter({ hasText: 'Top row:' })
  await expect(viewport).toBeVisible()
  await jumpButton.click()
  await waitForSettle(page)
  await scrollViewportBy(page, -800)
  await waitForSettle(page)

  const topRowBefore = (await topRowChip.textContent())?.trim()
  expect(topRowBefore).toBeTruthy()

  const beforeScreenshot = await getViewportScreenshot(page)

  await prependButton.click()
  await expect(page.getByText('Rows: 46')).toBeVisible()

  const immediateScreenshot = await getViewportScreenshot(page)
  const immediateDiffPixels = await countImageDiffPixels(page, beforeScreenshot, immediateScreenshot)

  await waitForAnimationFrame(page)
  const firstFrameScreenshot = await getViewportScreenshot(page)
  const firstFrameDiffPixels = await countImageDiffPixels(page, beforeScreenshot, firstFrameScreenshot)

  await waitForSettle(page)

  const afterScreenshot = await getViewportScreenshot(page)
  const diffPixels = await countImageDiffPixels(page, beforeScreenshot, afterScreenshot)

  await expect(topRowChip).toHaveText(topRowBefore!)
  expect(immediateDiffPixels).toBeLessThanOrEqual(TOP_EDGE_VISUAL_DIFF_LIMIT)
  expect(firstFrameDiffPixels).toBeLessThanOrEqual(TOP_EDGE_VISUAL_DIFF_LIMIT)
  expect(diffPixels).toBeLessThanOrEqual(TOP_EDGE_VISUAL_DIFF_LIMIT)
})

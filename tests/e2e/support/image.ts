import type { Page } from '@playwright/test'

export async function countImageDiffPixels(
  page: Page,
  before: Uint8Array,
  after: Uint8Array,
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

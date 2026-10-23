import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'
import { expect, test } from '@playwright/test'
import { avatarStyle, gradientAt } from '../../docs/.vitepress/components/demos/demo-data'
import { expectReadableGradients, expectReadableText, gradientContrast, openContrastPage, useContrastMode } from './support/contrast'
import { getVisibleItems, scrollViewportBy, viewport, waitForSettle } from './support/demo'

const routes = ['/', ...['guide', 'demos'].flatMap(section =>
  readdirSync(join(process.cwd(), 'docs', section))
    .filter(file => file.endsWith('.md'))
    .map(file => `/${section}/${file === 'index.md' ? '' : file.slice(0, -3)}`),
)]

for (const mode of ['light', 'dark'] as const) {
  test.describe(`${mode} docs contrast`, () => {
    test.beforeEach(async ({ page }) => {
      await useContrastMode(page, mode)
    })

    for (const route of routes) {
      test(`readable text on ${route}`, async ({ page }) => {
        await openContrastPage(page, route)
        await expectReadableText(page)

        // axe cannot reliably resolve background images; check text-bearing
        // gradients independently, including avatars with fixed inline colors.
        await expectReadableGradients(page)
      })
    }

    for (const [slug, axis, selector] of [
      ['dynamic-scroller', 'vertical', '[data-testid="demo:row"]'],
      ['headless-table', 'vertical', '[data-testid="demo:row"]'],
      ['horizontal', 'horizontal', '[data-testid="demo:card"]'],
      ['grid', 'vertical', '[data-testid="demo:card"]'],
    ] as const) {
      test(`readable recycled content in ${slug}`, async ({ page }) => {
        await openContrastPage(page, `/demos/${slug}`)
        await viewport(page).scrollIntoViewIfNeeded()
        const before = await getVisibleItems(page, selector, axis)
        await scrollViewportBy(page, 1200, axis)
        await waitForSettle(page)
        const after = await getVisibleItems(page, selector, axis)
        expect(after.length).toBeGreaterThan(0)
        expect(after.map(item => item.key)).not.toEqual(before.map(item => item.key))
        await expectReadableText(page)
        await expectReadableGradients(page)
      })
    }
  })
}

test('all generated avatar hues and card gradients keep white text readable', async ({ page }) => {
  await page.goto('/')
  const gradients = [
    ...Array.from({ length: 360 }, (_, hue) => avatarStyle(hue).background),
    ...Array.from({ length: 6 }, (_, index) => gradientAt(index)),
  ]
  const failures = (await gradientContrast(page, gradients)).filter(result => result.ratio < 4.5)
  expect(failures).toEqual([])
})

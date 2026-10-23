import type { Locator, Page } from '@playwright/test'
import { expect, test } from '@playwright/test'
import { expectReadableText, openContrastPage, useContrastMode } from './support/contrast'
import { control, waitForSettle } from './support/demo'

/** Audit actual hover, keyboard focus, and pressed states without following links. */
async function expectReadableStates(page: Page, target: Locator, selector: string) {
  await target.hover()
  await waitForSettle(page)
  await expectReadableText(page, selector)
  await page.mouse.move(0, 0)
  await page.keyboard.press('Tab')
  await target.focus()
  await expect(target).toBeFocused()
  await expectReadableText(page, selector)
  await target.hover()
  await page.mouse.down()
  try {
    await waitForSettle(page)
    await expectReadableText(page, selector)
  }
  finally {
    // Release away from target so a button action or link navigation cannot fire.
    await page.mouse.move(0, 0)
    await page.mouse.up()
  }
}

for (const mode of ['light', 'dark'] as const) {
  test.describe(`${mode} interactive contrast`, () => {
    test.beforeEach(async ({ page }) => {
      await useContrastMode(page, mode)
    })

    test('docs links remain readable when hovered or focused', async ({ page }) => {
      await openContrastPage(page, '/demos/')
      const target = page.locator('.vp-doc a').filter({ hasText: 'DynamicScroller demo' }).first()
      await target.hover()
      await waitForSettle(page)
      await expectReadableText(page, '.vp-doc')
      await page.mouse.move(0, 0)
      await page.keyboard.press('Tab')
      await target.focus()
      await expect(target).toBeFocused()
      await expectReadableText(page, '.vp-doc')
    })

    test('brand button stays readable in every interaction state', async ({ page }) => {
      await openContrastPage(page, '/')
      await expectReadableStates(page, page.getByRole('link', { name: 'Get Started', exact: true }), '.VPHero .VPButton.brand')
    })

    test('primary and secondary demo controls stay readable', async ({ page }) => {
      await openContrastPage(page, '/demos/recycle-scroller')
      for (const name of ['jump', 'add-500']) {
        await expectReadableStates(page, control(page, name), `[data-testid="demo:control:${name}"]`)
      }
    })

    test('table text and all status labels remain readable on hover', async ({ page }) => {
      await openContrastPage(page, '/demos/headless-table')
      const rows = page.getByTestId('demo:row')
      for (const status of ['Active', 'Review', 'Paused']) {
        const badge = rows.getByText(status, { exact: true }).first()
        await badge.hover()
        await waitForSettle(page)
        await expectReadableText(page, '.demo-headless-table')
      }
    })

    test('search results and highlighted matches stay readable', async ({ page }) => {
      await openContrastPage(page, '/')
      await page.keyboard.press('Control+k')
      await page.getByRole('searchbox').fill('DynamicScroller')
      const results = page.getByRole('option')
      await expect(results.first()).toBeVisible()
      await expect(page.locator('.VPLocalSearchBox mark').first()).toBeVisible()
      await expectReadableText(page, '.VPLocalSearchBox')
      await results.nth(1).hover()
      await expect(results.nth(1)).toHaveAttribute('aria-selected', 'true')
      await expectReadableText(page, '.VPLocalSearchBox')
      await page.keyboard.press('ArrowDown')
      await expectReadableText(page, '.VPLocalSearchBox')
    })

    test('mobile navigation stays readable at 390px width', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 })
      await openContrastPage(page, '/demos/')
      await page.getByRole('button', { name: 'mobile navigation', exact: true }).click()
      await expect(page.locator('#VPNavScreen')).toBeVisible()
      await expectReadableText(page)
    })
  })
}

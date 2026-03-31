/* eslint-disable e18e/prefer-static-regex */

import { expect, test } from '@playwright/test'
import {
  control,
  gotoDemo,
  metric,
  setControlValue,
  waitForSettle,
} from './support/demo'

interface VisibleRowMetric {
  bottom: number
  id: number
  top: number
}

interface VisibleRowLayoutMetric extends VisibleRowMetric {
  height: number
  slack: number
}

async function scrollWindowBy(page: Parameters<typeof test>[0]['page'], delta: number) {
  await page.evaluate(nextDelta => window.scrollBy(0, nextDelta), delta)
}

async function scrollWindowToTop(page: Parameters<typeof test>[0]['page']) {
  await page.evaluate(() => window.scrollTo(0, 0))
}

async function focusDemo(page: Parameters<typeof test>[0]['page']) {
  await page.getByTestId('demo:viewport').scrollIntoViewIfNeeded()
  await waitForSettle(page)
}

async function readVisibleRange(page: Parameters<typeof test>[0]['page']) {
  const text = (await metric(page, 'visible-range').textContent()) ?? ''
  const [start = 0, end = 0] = Array.from(text.matchAll(/\d+/g), match => Number(match[0]))
  return { start, end }
}

async function getVisibleRows(page: Parameters<typeof test>[0]['page']) {
  return page.locator('[data-testid="demo:row"]').evaluateAll((elements) => {
    return elements
      .map((row): VisibleRowMetric | null => {
        const element = row as HTMLElement
        const itemView = element.closest('.vue-recycle-scroller__item-view') as HTMLElement | null
        if (!itemView || getComputedStyle(itemView).visibility === 'hidden') {
          return null
        }

        const rect = itemView.getBoundingClientRect()
        if (rect.bottom <= 0 || rect.top >= window.innerHeight) {
          return null
        }

        return {
          id: Number(element.dataset.rowId),
          top: rect.top,
          bottom: rect.bottom,
        }
      })
      .filter((row): row is VisibleRowMetric => row != null)
      .sort((a, b) => a.top - b.top)
  })
}

async function getVisibleRowLayout(page: Parameters<typeof test>[0]['page']) {
  return page.locator('[data-testid="demo:row"]').evaluateAll((elements) => {
    return elements
      .map((row): VisibleRowLayoutMetric | null => {
        const element = row as HTMLElement
        const itemView = element.closest('.vue-recycle-scroller__item-view') as HTMLElement | null
        if (!itemView || getComputedStyle(itemView).visibility === 'hidden') {
          return null
        }

        const rect = itemView.getBoundingClientRect()
        if (rect.bottom <= 0 || rect.top >= window.innerHeight) {
          return null
        }

        const copy = element.querySelector('.demo-window-copy') as HTMLElement | null
        const meta = element.querySelector('.demo-window-meta') as HTMLElement | null
        const avatar = element.querySelector('.demo-avatar') as HTMLElement | null
        const contentBottom = Math.max(
          copy?.getBoundingClientRect().bottom ?? rect.top,
          meta?.getBoundingClientRect().bottom ?? rect.top,
          avatar?.getBoundingClientRect().bottom ?? rect.top,
        )

        return {
          id: Number(element.dataset.rowId),
          top: rect.top,
          bottom: rect.bottom,
          height: rect.height,
          slack: Math.round(rect.bottom - contentBottom),
        }
      })
      .filter((row): row is VisibleRowLayoutMetric => row != null)
      .sort((a, b) => a.top - b.top)
  })
}

function expectContiguousRows(rows: VisibleRowMetric[]) {
  expect(rows.length).toBeGreaterThan(3)

  for (let index = 1; index < rows.length; index++) {
    const previous = rows[index - 1]
    const current = rows[index]
    const gap = current.top - previous.bottom

    expect(current.id).toBe(previous.id + 1)
    expect(current.top).toBeGreaterThanOrEqual(previous.top - 1)
    expect(Math.abs(gap)).toBeLessThanOrEqual(8)
  }
}

test('window scroller demo smoke', async ({ page }) => {
  await gotoDemo(page, 'window-scroller')
  await focusDemo(page)

  const before = await readVisibleRange(page)
  expect(before.end).toBeGreaterThan(before.start)

  await scrollWindowBy(page, 1800)
  await waitForSettle(page)

  const after = await readVisibleRange(page)
  expect(after.end).toBeGreaterThan(after.start)
  expect(after.start).toBeGreaterThan(before.start)
})

test('window scroller demo still lays out correctly after a hard reload', async ({ page }) => {
  await gotoDemo(page, 'window-scroller')
  await page.reload()
  await focusDemo(page)

  const viewport = page.getByTestId('demo:viewport')
  const firstRow = page.locator('[data-testid="demo:row"]').first()
  const position = await firstRow.evaluate((element) => {
    const itemView = (element as HTMLElement).closest('.vue-recycle-scroller__item-view')
    return itemView ? getComputedStyle(itemView).position : ''
  })
  expect(position).toBe('absolute')

  const range = await readVisibleRange(page)
  expect(range.end).toBeGreaterThan(range.start)

  await scrollWindowBy(page, 1200)
  await waitForSettle(page)

  const nextRange = await readVisibleRange(page)
  expect(nextRange.start).toBeGreaterThan(range.start)
  await expect(viewport).toBeVisible()
})

test('window scroller jump accounts for before-slot height changes', async ({ browserName, page }) => {
  test.skip(browserName !== 'chromium')

  await gotoDemo(page, 'window-scroller')
  await focusDemo(page)

  const hero = page.getByTestId('demo:hero')
  const heroHeightBefore = await hero.evaluate(el => (el as HTMLElement).getBoundingClientRect().height)

  await setControlValue(control(page, 'scroll-to'), 260)
  await control(page, 'jump').click()
  await waitForSettle(page)

  const collapsedWindowY = await page.evaluate(() => Math.round(window.scrollY))
  expect(collapsedWindowY).toBeGreaterThan(1000)
  const collapsedRange = await readVisibleRange(page)
  expect(collapsedRange.start).toBeGreaterThan(220)

  await scrollWindowToTop(page)
  await waitForSettle(page)

  await control(page, 'expanded-hero').click()
  await waitForSettle(page)

  const heroHeightAfter = await hero.evaluate(el => (el as HTMLElement).getBoundingClientRect().height)
  expect(heroHeightAfter).toBeGreaterThan(heroHeightBefore)

  await control(page, 'jump').click()
  await waitForSettle(page)

  const expandedRange = await readVisibleRange(page)
  expect(expandedRange.start).toBeGreaterThan(220)
  expect(Math.abs(expandedRange.start - collapsedRange.start)).toBeLessThanOrEqual(8)
  expect(Math.abs(expandedRange.end - collapsedRange.end)).toBeLessThanOrEqual(8)
})

test('window scroller remains usable with variable item heights', async ({ browserName, page }) => {
  test.skip(browserName !== 'chromium')

  await gotoDemo(page, 'window-scroller')
  await focusDemo(page)

  await setControlValue(control(page, 'scroll-to'), 220)
  await control(page, 'jump').click()
  await waitForSettle(page)

  const fixedRange = await readVisibleRange(page)
  expect(fixedRange.start).toBeGreaterThan(180)

  await control(page, 'variable-height').click()
  await waitForSettle(page)
  await control(page, 'jump').click()
  await waitForSettle(page)

  const variableRange = await readVisibleRange(page)
  expect(variableRange.end).toBeGreaterThan(variableRange.start)
  expect(variableRange.start).toBeGreaterThan(150)
  expectContiguousRows(await getVisibleRows(page))
  const rowLayout = await getVisibleRowLayout(page)
  expect(new Set(rowLayout.map(row => row.height)).size).toBeGreaterThan(1)
  for (const row of rowLayout) {
    expect(row.slack).toBeLessThanOrEqual(44)
  }

  for (const delta of [1400, 2200, -1800, 3200]) {
    await scrollWindowBy(page, delta)
    await waitForSettle(page)

    const afterScroll = await readVisibleRange(page)
    expect(afterScroll.end).toBeGreaterThan(afterScroll.start)
    expectContiguousRows(await getVisibleRows(page))
  }
})

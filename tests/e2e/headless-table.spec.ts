import { expect, test } from '@playwright/test'
import {
  control,
  expectDemoSmoke,
  metric,
  readMetricNumbers,
  scrollViewportBy,
  setControlValue,
  viewport,
  waitForSettle,
} from './support/demo'

interface VisibleRowMetric {
  bottom: number
  id: number
  top: number
}

async function getVisibleRows(page: Parameters<typeof test>[0]['page']) {
  return page.locator('[data-testid="demo:row"]').evaluateAll((elements) => {
    const scroller = document.querySelector<HTMLElement>('[data-testid="demo:viewport"]')
    if (!scroller) {
      return []
    }

    const scrollerRect = scroller.getBoundingClientRect()

    return elements
      .map((row): VisibleRowMetric | null => {
        const element = row as HTMLElement
        const rect = element.getBoundingClientRect()
        if (getComputedStyle(element).visibility === 'hidden' || rect.bottom <= scrollerRect.top || rect.top >= scrollerRect.bottom) {
          return null
        }

        return {
          id: Number(element.dataset.rowId),
          top: rect.top - scrollerRect.top,
          bottom: rect.bottom - scrollerRect.top,
        }
      })
      .filter((row): row is VisibleRowMetric => row != null)
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

test('headless table demo smoke', async ({ page }) => {
  await expectDemoSmoke(page, {
    slug: 'headless-table',
    itemSelector: '[data-testid="demo:row"]',
  })
})

test('headless table keeps rows contiguous and supports filter/jump', async ({ browserName, page }) => {
  test.skip(browserName !== 'chromium')

  await page.goto('/demos/headless-table')

  const rowsMetric = metric(page, 'rows')
  const initialRows = (await readMetricNumbers(rowsMetric))[0] ?? 0

  await control(page, 'filter').fill('Europe')
  await waitForSettle(page)
  expect((await readMetricNumbers(rowsMetric))[0] ?? 0).toBeLessThan(initialRows)

  await control(page, 'filter').fill('')
  await setControlValue(control(page, 'scroll-to'), 240)
  await control(page, 'jump').click()
  await waitForSettle(page)
  expect((await readMetricNumbers(metric(page, 'visible-range')))[0] ?? 0).toBeGreaterThan(150)

  await expect(viewport(page)).toBeVisible()

  const currentScrollTop = await viewport(page).evaluate(el => (el as HTMLElement).scrollTop)
  await scrollViewportBy(page, -currentScrollTop)
  await waitForSettle(page)

  for (const delta of [5000, 6800, -9200, 15400]) {
    await scrollViewportBy(page, delta)
    await waitForSettle(page)
    expectContiguousRows(await getVisibleRows(page))
  }
})

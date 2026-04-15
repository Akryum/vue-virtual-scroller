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

test('headless table keeps advancing under mouse-wheel scrolling', async ({ browserName, page }) => {
  test.skip(browserName !== 'chromium')

  await page.goto('/demos/headless-table')
  await expect(viewport(page)).toBeVisible()
  await waitForSettle(page)
  await viewport(page).hover()

  for (let step = 0; step < 8; step++) {
    await page.mouse.wheel(0, 200)
    await waitForSettle(page)
  }

  const { firstVisibleId, scrollTop } = await viewport(page).evaluate((el) => {
    const viewportRect = el.getBoundingClientRect()
    const visibleRows = Array.from(el.querySelectorAll<HTMLElement>('[data-testid="demo:row"]'), (row) => {
      const rect = row.getBoundingClientRect()
      return {
        id: Number(row.dataset.rowId),
        hidden: getComputedStyle(row).visibility === 'hidden',
        top: rect.top,
        bottom: rect.bottom,
      }
    })
      .filter(row => !row.hidden && row.bottom > viewportRect.top && row.top < viewportRect.bottom)
      .sort((a, b) => a.top - b.top)

    return {
      scrollTop: (el as HTMLElement).scrollTop,
      firstVisibleId: visibleRows[0]?.id ?? null,
    }
  })

  expect(scrollTop).toBeGreaterThan(1200)
  expect(firstVisibleId).not.toBeNull()
  expect(firstVisibleId ?? 0).toBeGreaterThan(15)
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

  const tableLayout = await page.locator('.demo-headless-table').evaluate((table) => {
    const body = table.querySelector('tbody')
    const row = body?.querySelector('tr:not(.demo-headless-table__spacer)')
    const headerCell = table.querySelector('th')
    const bodyCell = row?.querySelector('td')
    if (!body || !row || !headerCell || !bodyCell) {
      return null
    }

    const headerRect = headerCell.getBoundingClientRect()
    const cellRect = bodyCell.getBoundingClientRect()

    return {
      tbodyDisplay: getComputedStyle(body).display,
      rowDisplay: getComputedStyle(row).display,
      rowPosition: getComputedStyle(row).position,
      rowTransform: getComputedStyle(row).transform,
      headerLeft: headerRect.left,
      cellLeft: cellRect.left,
    }
  })

  expect(tableLayout).not.toBeNull()
  expect(tableLayout?.tbodyDisplay).toBe('table-row-group')
  expect(tableLayout?.rowDisplay).toBe('table-row')
  expect(tableLayout?.rowPosition).toBe('static')
  expect(tableLayout?.rowTransform).toBe('none')
  expect(Math.abs((tableLayout?.headerLeft ?? 0) - (tableLayout?.cellLeft ?? 0))).toBeLessThanOrEqual(2)
})

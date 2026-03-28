import { expect, test } from '@playwright/test'

interface VisibleRowMetric {
  bottom: number
  id: number
  top: number
}

async function waitForSettle(page: Parameters<typeof test>[0]['page']) {
  await page.waitForTimeout(50)
  await page.evaluate(async () => {
    for (let index = 0; index < 8; index++) {
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
    }
  })
}

async function getVisibleRows(page: Parameters<typeof test>[0]['page']) {
  return page.locator('.demo-headless-table__body > .demo-headless-table__row').evaluateAll((elements) => {
    const scroller = document.querySelector<HTMLElement>('.demo-table-viewport')
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

        const idText = element.querySelector('td')?.textContent?.replace('#', '').trim() ?? ''
        return {
          id: Number(idText),
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

test('headless table stays contiguous after fast scrolling', async ({ page }) => {
  await page.goto('/demos/headless-table')

  const scroller = page.locator('.demo-table-viewport')
  await scroller.waitFor()

  for (const target of [0, 5000, 11800, 2600, 18000]) {
    await scroller.evaluate((element, value) => {
      const viewport = element as HTMLElement
      viewport.scrollTop = value
      viewport.dispatchEvent(new Event('scroll'))
    }, target)

    await waitForSettle(page)
    expectContiguousRows(await getVisibleRows(page))
  }
})

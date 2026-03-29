import type { Locator, Page } from '@playwright/test'
import { expect } from '@playwright/test'

export type DemoAxis = 'horizontal' | 'vertical'

export interface VisibleMetric {
  end: number
  key: string
  start: number
}

export interface DemoSmokeOptions {
  axis?: DemoAxis
  itemSelector: string
  setup?: (page: Page) => Promise<void>
  slug: string
}

const METRIC_NUMBER_RE = /-?\d+/g

export async function gotoDemo(page: Page, slug: string) {
  await page.goto(`/demos/${slug}`)
  await expect(page.getByTestId(`demo:${slug}`)).toBeVisible()
}

export function viewport(page: Page) {
  return page.getByTestId('demo:viewport')
}

export function control(page: Page, name: string) {
  return page.getByTestId(`demo:control:${name}`)
}

export function metric(page: Page, name: string) {
  return page.getByTestId(`demo:metric:${name}`)
}

export async function waitForAnimationFrame(page: Page) {
  await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => resolve())))
}

export async function waitForSettle(page: Page, frames = 8) {
  await page.waitForTimeout(50)
  await page.evaluate(async (frameCount) => {
    for (let index = 0; index < frameCount; index++) {
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
    }
  }, frames)
}

export async function scrollViewportBy(page: Page, delta: number, axis: DemoAxis = 'vertical') {
  await viewport(page).evaluate((element, { axis, delta }) => {
    const target = element as HTMLElement
    if (axis === 'horizontal') {
      target.scrollLeft += delta
    }
    else {
      target.scrollTop += delta
    }
    target.dispatchEvent(new Event('scroll'))
  }, { axis, delta })
}

export async function setControlValue(target: Locator, value: number | string) {
  await target.evaluate((element, nextValue) => {
    const input = element as HTMLInputElement
    input.value = String(nextValue)
    input.dispatchEvent(new Event('input', { bubbles: true }))
    input.dispatchEvent(new Event('change', { bubbles: true }))
  }, value)
}

export async function readMetricNumbers(target: Locator) {
  const text = (await target.textContent()) ?? ''
  return Array.from(text.matchAll(METRIC_NUMBER_RE), match => Number(match[0]))
}

export async function getVisibleItems(
  page: Page,
  itemSelector: string,
  axis: DemoAxis = 'vertical',
) {
  return page.locator(itemSelector).evaluateAll((elements, currentAxis) => {
    const demoViewport = document.querySelector<HTMLElement>('[data-testid="demo:viewport"]')
    if (!demoViewport) {
      return []
    }

    const viewportRect = demoViewport.getBoundingClientRect()

    return elements
      .map((element): VisibleMetric | null => {
        const html = element as HTMLElement
        const rect = html.getBoundingClientRect()
        const hidden = getComputedStyle(html).visibility === 'hidden'
        const start = currentAxis === 'horizontal' ? rect.left - viewportRect.left : rect.top - viewportRect.top
        const end = currentAxis === 'horizontal' ? rect.right - viewportRect.left : rect.bottom - viewportRect.top
        const outside = currentAxis === 'horizontal'
          ? rect.right <= viewportRect.left || rect.left >= viewportRect.right
          : rect.bottom <= viewportRect.top || rect.top >= viewportRect.bottom

        if (hidden || outside) {
          return null
        }

        return {
          key: html.dataset.rowId ?? html.dataset.cardId ?? html.textContent?.trim() ?? '',
          start,
          end,
        }
      })
      .filter((item): item is VisibleMetric => item != null)
      .sort((a, b) => a.start - b.start)
  }, axis)
}

export async function expectDemoSmoke(page: Page, options: DemoSmokeOptions) {
  await gotoDemo(page, options.slug)
  await options.setup?.(page)

  const axis = options.axis ?? 'vertical'
  await expect(viewport(page)).toBeVisible()
  await waitForSettle(page)

  const before = await getVisibleItems(page, options.itemSelector, axis)
  expect(before.length).toBeGreaterThan(0)

  await scrollViewportBy(page, axis === 'horizontal' ? 900 : 1200, axis)
  await waitForSettle(page)

  const after = await getVisibleItems(page, options.itemSelector, axis)
  expect(after.length).toBeGreaterThan(0)
  expect(after.map(item => item.key)).not.toEqual(before.map(item => item.key))
}

export async function getViewportEdgeDistance(page: Page, axis: DemoAxis = 'vertical') {
  return viewport(page).evaluate((element, currentAxis) => {
    const target = element as HTMLElement
    if (currentAxis === 'horizontal') {
      return target.scrollWidth - (target.scrollLeft + target.clientWidth)
    }
    return target.scrollHeight - (target.scrollTop + target.clientHeight)
  }, axis)
}

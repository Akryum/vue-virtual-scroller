import type { View } from '../types'
import { afterEach, describe, expect, it } from 'vitest'
import { computed, createApp, defineComponent, h, ref, withDirectives } from 'vue'
import { useDynamicScroller } from './useDynamicScroller'

interface BrowserRow {
  id: number
  label: string
  summary: string
}

interface VisibleRowMetric {
  bottom: number
  height: number
  id: number
  top: number
}

function createRows(count = 400): BrowserRow[] {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    label: `Row ${index + 1}`,
    summary: Array.from({ length: (index % 5) + 2 }, (_unused, partIndex) => `segment-${index}-${partIndex}`).join(' '),
  }))
}

function waitForFrames(count = 6) {
  return new Promise<void>((resolve) => {
    function step() {
      if (count <= 0) {
        resolve()
        return
      }

      count--
      requestAnimationFrame(step)
    }

    requestAnimationFrame(step)
  })
}

function getVisibleRowMetrics(scroller: HTMLElement) {
  const scrollerRect = scroller.getBoundingClientRect()
  return Array.from(scroller.querySelectorAll<HTMLElement>('[data-testid="browser-row"]'), (row): VisibleRowMetric | null => {
    const rect = row.getBoundingClientRect()
    if (getComputedStyle(row).visibility === 'hidden' || rect.bottom <= scrollerRect.top || rect.top >= scrollerRect.bottom) {
      return null
    }

    return {
      id: Number(row.dataset.rowId),
      top: rect.top - scrollerRect.top,
      bottom: rect.bottom - scrollerRect.top,
      height: rect.height,
    }
  })
    .filter((row): row is VisibleRowMetric => row != null)
    .sort((a, b) => a.top - b.top)
}

function expectContiguousVisibleRows(rows: VisibleRowMetric[]) {
  expect(rows.length).toBeGreaterThan(3)

  for (let index = 1; index < rows.length; index++) {
    const previous = rows[index - 1]
    const current = rows[index]
    const gap = current.top - previous.bottom

    expect(current.id).toBe(previous.id + 1)
    expect(current.top).toBeGreaterThanOrEqual(previous.top - 1)
    expect(Math.abs(gap)).toBeLessThanOrEqual(8)
    expect(current.height).toBeGreaterThan(0)
  }
}

function mountBrowserFixture() {
  const container = document.createElement('div')
  document.body.innerHTML = ''
  document.body.appendChild(container)

  const Fixture = defineComponent({
    setup() {
      const rows = createRows()
      const scrollerEl = ref<HTMLElement>()
      const dynamicScroller = useDynamicScroller(computed(() => ({
        items: rows,
        keyField: 'id',
        direction: 'vertical' as const,
        minItemSize: 48,
        el: scrollerEl.value,
        buffer: 280,
      })))

      const {
        handleScroll,
        pool,
        totalSize,
        vDynamicScrollerItem,
      } = dynamicScroller

      function rowOf(view: View) {
        return view.item as { id: number, item: BrowserRow, size?: number }
      }

      return () =>
        h('div', {
          'ref': scrollerEl,
          'data-testid': 'browser-viewport',
          'style': {
            height: '320px',
            overflow: 'auto',
            position: 'relative',
            width: '540px',
            border: '1px solid #ccd2da',
          },
          'onScroll': handleScroll,
        }, [
          h('div', {
            style: {
              height: `${totalSize.value}px`,
              position: 'relative',
            },
          }, pool.value.map(view =>
            withDirectives(h('div', {
              'key': view.nr.id,
              'data-testid': 'browser-row',
              'data-row-id': String(rowOf(view).item.id),
              'style': {
                background: '#fff',
                borderBottom: '1px solid #e5e7eb',
                boxSizing: 'border-box',
                padding: '10px 14px',
              },
            }, [
              h('strong', rowOf(view).item.label),
              h('p', {
                style: {
                  margin: '6px 0 0',
                  lineHeight: '1.4',
                  whiteSpace: 'normal',
                },
              }, rowOf(view).item.summary),
            ]), [[vDynamicScrollerItem, {
              view,
              sizeDependencies: [
                rowOf(view).item.label,
                rowOf(view).item.summary,
              ],
            }]]),
          )),
        ])
    },
  })

  const app = createApp(Fixture)
  app.mount(container)

  return {
    container,
    scroller: () => container.querySelector<HTMLElement>('[data-testid="browser-viewport"]')!,
    unmount: () => {
      app.unmount()
      container.remove()
    },
  }
}

function mountShiftFixture() {
  const container = document.createElement('div')
  document.body.innerHTML = ''
  document.body.appendChild(container)

  const Fixture = defineComponent({
    setup(_props, { expose }) {
      const allRows = createRows(320)
      const start = 120
      const count = 36
      const cursor = ref(start)
      const rows = ref(allRows.slice(start, start + count))
      const scrollerEl = ref<HTMLElement>()
      const dynamicScroller = useDynamicScroller(computed(() => ({
        items: rows.value,
        keyField: 'id',
        direction: 'vertical' as const,
        minItemSize: 48,
        el: scrollerEl.value,
        buffer: 280,
        shift: true,
      })))

      const {
        handleScroll,
        pool,
        totalSize,
        vDynamicScrollerItem,
      } = dynamicScroller

      function prepend(count: number) {
        if (cursor.value <= 0) {
          return
        }

        const nextStart = Math.max(0, cursor.value - count)
        rows.value = [...allRows.slice(nextStart, cursor.value), ...rows.value]
        cursor.value = nextStart
      }

      function rowOf(view: View) {
        return view.item as { id: number, item: BrowserRow, size?: number }
      }

      expose({
        prepend,
      })

      return () =>
        h('div', {
          'ref': scrollerEl,
          'data-testid': 'browser-viewport',
          'style': {
            height: '320px',
            overflow: 'auto',
            position: 'relative',
            width: '540px',
            border: '1px solid #ccd2da',
          },
          'onScroll': handleScroll,
        }, [
          h('div', {
            style: {
              height: `${totalSize.value}px`,
              position: 'relative',
            },
          }, pool.value.map(view =>
            withDirectives(h('div', {
              'key': view.nr.id,
              'data-testid': 'browser-row',
              'data-row-id': String(rowOf(view).item.id),
              'style': {
                background: '#fff',
                borderBottom: '1px solid #e5e7eb',
                boxSizing: 'border-box',
                padding: '10px 14px',
              },
            }, [
              h('strong', rowOf(view).item.label),
              h('p', {
                style: {
                  margin: '6px 0 0',
                  lineHeight: '1.4',
                  whiteSpace: 'normal',
                },
              }, rowOf(view).item.summary),
            ]), [[vDynamicScrollerItem, {
              view,
              sizeDependencies: [
                rowOf(view).item.label,
                rowOf(view).item.summary,
              ],
            }]]),
          )),
        ])
    },
  })

  const app = createApp(Fixture)
  const vm = app.mount(container) as unknown as { prepend: (count: number) => void, scrollerEl: HTMLElement }

  return {
    container,
    prepend: (count: number) => vm.prepend(count),
    scroller: () => container.querySelector<HTMLElement>('[data-testid="browser-viewport"]')!,
    unmount: () => {
      app.unmount()
      container.remove()
    },
  }
}

function expectVisibleRowsAnchored(before: VisibleRowMetric[], after: VisibleRowMetric[]) {
  const comparable = before
    .map((row) => {
      const next = after.find(candidate => candidate.id === row.id)
      if (!next) {
        return null
      }
      return {
        before: row,
        after: next,
      }
    })
    .filter((value): value is { before: VisibleRowMetric, after: VisibleRowMetric } => value != null)

  expect(comparable.length).toBeGreaterThan(2)

  for (const pair of comparable) {
    expect(Math.abs(pair.after.top - pair.before.top)).toBeLessThanOrEqual(2)
  }
}

describe('useDynamicScroller browser reliability', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('keeps visible rows contiguous after fast scrolling reuses pooled views', async () => {
    const fixture = mountBrowserFixture()
    const scroller = fixture.scroller()

    await waitForFrames(8)

    for (const target of [0, 3600, 9800, 2200, 15000]) {
      scroller.scrollTop = target
      scroller.dispatchEvent(new Event('scroll'))
      await waitForFrames(8)
      expectContiguousVisibleRows(getVisibleRowMetrics(scroller))
    }

    fixture.unmount()
  })

  it('keeps visible rows anchored when prepending from the middle and upper viewport', async () => {
    const fixture = mountShiftFixture()
    const scroller = fixture.scroller()

    await waitForFrames(8)

    for (const target of [2300, 1500]) {
      scroller.scrollTop = target
      scroller.dispatchEvent(new Event('scroll'))
      await waitForFrames(8)

      const before = getVisibleRowMetrics(scroller)
      fixture.prepend(10)
      await waitForFrames(8)

      expectVisibleRowsAnchored(before, getVisibleRowMetrics(scroller))
    }

    fixture.unmount()
  })
})

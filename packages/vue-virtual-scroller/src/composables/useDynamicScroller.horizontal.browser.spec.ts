import type { View } from '../types'
import { afterEach, describe, expect, it } from 'vitest'
import { computed, createApp, defineComponent, h, ref, withDirectives } from 'vue'
import { useDynamicScroller } from './useDynamicScroller'

interface HorizontalCard {
  id: number
  message: string
}

interface VisibleCardMetric {
  id: number
  left: number
  right: number
  width: number
}

function createCards(count = 240): HorizontalCard[] {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    message: Array.from({ length: (index % 5) + 3 }).fill(`card-${index + 1}`).join(' '),
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

function getVisibleCards(scroller: HTMLElement) {
  const rect = scroller.getBoundingClientRect()
  return Array.from(scroller.querySelectorAll<HTMLElement>('[data-testid="browser-card"]'), (card): VisibleCardMetric | null => {
    const cardRect = card.getBoundingClientRect()
    if (getComputedStyle(card).visibility === 'hidden' || cardRect.right <= rect.left || cardRect.left >= rect.right) {
      return null
    }

    return {
      id: Number(card.dataset.cardId),
      left: cardRect.left - rect.left,
      right: cardRect.right - rect.left,
      width: cardRect.width,
    }
  })
    .filter((card): card is VisibleCardMetric => card != null)
    .sort((a, b) => a.left - b.left)
}

describe('useDynamicScroller horizontal browser reliability', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('updates the visible card set while preserving measured widths', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    const Fixture = defineComponent({
      setup() {
        const cards = createCards()
        const scrollerEl = ref<HTMLElement>()
        const dynamicScroller = useDynamicScroller(computed(() => ({
          items: cards,
          keyField: 'id',
          direction: 'horizontal' as const,
          minItemSize: 160,
          el: scrollerEl.value,
          buffer: 220,
        })))

        const {
          handleScroll,
          pool,
          totalSize,
          vDynamicScrollerItem,
        } = dynamicScroller

        function cardOf(view: View) {
          return view.item as { item: HorizontalCard }
        }

        function widthFor(message: string) {
          return Math.max(160, Math.min(320, message.length * 8))
        }

        return () =>
          h('div', {
            'ref': scrollerEl,
            'data-testid': 'browser-horizontal-viewport',
            'style': {
              width: '420px',
              height: '180px',
              overflow: 'auto',
              position: 'relative',
            },
            'onScroll': handleScroll,
          }, [
            h('div', {
              style: {
                width: `${totalSize.value}px`,
                height: '100%',
                position: 'relative',
              },
            }, pool.value.map(view =>
              withDirectives(
                h('div', {
                  'key': view.nr.id,
                  'data-testid': 'browser-card',
                  'data-card-id': String(cardOf(view).item.id),
                  'style': {
                    width: `${widthFor(cardOf(view).item.message)}px`,
                    height: '140px',
                    boxSizing: 'border-box',
                    borderRight: '1px solid #e5e7eb',
                    padding: '12px',
                  },
                }, cardOf(view).item.message),
                [[vDynamicScrollerItem, { view, sizeDependencies: [cardOf(view).item.message] }]],
              ),
            )),
          ])
      },
    })

    const app = createApp(Fixture)
    app.mount(container)

    const scroller = container.querySelector<HTMLElement>('[data-testid="browser-horizontal-viewport"]')!
    await waitForFrames(8)

    const before = getVisibleCards(scroller)
    expect(before.length).toBeGreaterThan(1)
    expect(before.every(card => card.width > 0)).toBe(true)

    scroller.scrollLeft = 1800
    scroller.dispatchEvent(new Event('scroll'))
    await waitForFrames(8)

    const after = getVisibleCards(scroller)
    expect(after.length).toBeGreaterThan(1)
    expect(after.every(card => card.width > 0)).toBe(true)
    expect(after.map(card => card.id)).not.toEqual(before.map(card => card.id))

    app.unmount()
    container.remove()
  })
})

import type { ViewWithStyleStamp } from '../composables/useRecycleScroller'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, markRaw, nextTick, shallowReactive } from 'vue'
import { getPooledViewStyle } from './viewStyle'

function createTestView(used: boolean): ViewWithStyleStamp {
  return shallowReactive({
    item: { id: 'A' },
    position: 0,
    offset: 0,
    _vs_styleStamp: 0,
    _vs_visibilityStamp: 0,
    nr: markRaw({
      id: 1,
      index: 0,
      used,
      key: 'A',
      type: 'default',
    }),
  }) as unknown as ViewWithStyleStamp
}

describe('getPooledViewStyle reactivity', () => {
  it('updates the rendered visibility style when nr.used flips and the visibility stamp is bumped', async () => {
    // `view.nr` is markRaw, so reading `view.nr.used` inside a render context
    // establishes no reactive dep. Without anchoring on the visibility stamp,
    // flipping `used` would not re-evaluate the inline style and parked rows
    // would keep `visibility: visible`.
    const view = createTestView(true)

    const Harness = defineComponent({
      setup() {
        return () =>
          h('div', {
            'data-testid': 'pooled',
            'style': getPooledViewStyle(view, { direction: 'vertical', mode: 'transform' }),
          })
      },
    })

    const wrapper = mount(Harness)
    await nextTick()

    const el = wrapper.get('[data-testid="pooled"]').element as HTMLElement
    expect(el.style.visibility).toBe('visible')

    // Mimic the recycler flipping the view to unused: the composable mutates
    // `nr.used` and bumps `_vs_visibilityStamp` on the shallow-reactive view.
    view.nr.used = false
    view._vs_visibilityStamp++

    await nextTick()

    expect(el.style.visibility).toBe('hidden')
  })
})

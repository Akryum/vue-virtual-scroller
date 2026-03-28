import type { View } from '../types'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick, reactive, ref } from 'vue'
import { useRecycleScroller } from './useRecycleScroller'

function createView(index: number, used = true): View {
  return {
    item: { id: index },
    position: 0,
    offset: 0,
    nr: {
      id: index,
      index,
      used,
      key: index,
      type: 'default',
    },
  }
}

function mountHarness() {
  const onUpdate = vi.fn()
  const options = reactive({
    items: Array.from({ length: 6 }, (_, id) => ({ id })),
    keyField: 'id',
    direction: 'vertical' as const,
    itemSize: 10,
    gridItems: undefined,
    itemSecondarySize: undefined,
    minItemSize: null,
    sizeField: 'size',
    typeField: 'type',
    buffer: 0,
    pageMode: false,
    prerender: 0,
    emitUpdate: true,
    updateInterval: 0,
  })

  const Harness = defineComponent({
    setup() {
      const el = ref<HTMLElement>()
      const state = useRecycleScroller(options, el, undefined, undefined, {
        onUpdate,
      })

      return {
        ...state,
        el,
      }
    },
    template: '<div ref="el" style="height: 100px; overflow-y: auto;" />',
  })

  const wrapper = mount(Harness)

  return {
    wrapper,
    vm: wrapper.vm as any,
    onUpdate,
  }
}

describe('useRecycleScroller', () => {
  it('does not refresh when visible views remain contiguous after sorting', async () => {
    const { vm, onUpdate } = mountHarness()

    await nextTick()
    await nextTick()
    onUpdate.mockClear()

    vm.pool = [
      createView(3, true),
      createView(1, false),
      createView(4, true),
    ]

    vm.sortViews()

    expect(onUpdate).not.toHaveBeenCalled()
    expect(vm.visiblePool.map((view: View) => view.nr.index)).toEqual([3, 4])
  })

  it('refreshes when sorting reveals a gap between visible views', async () => {
    const { vm, onUpdate } = mountHarness()

    await nextTick()
    await nextTick()
    onUpdate.mockClear()

    vm.pool = [
      createView(3, true),
      createView(1, false),
      createView(5, true),
    ]

    vm.sortViews()

    expect(onUpdate).toHaveBeenCalledTimes(1)
  })
})

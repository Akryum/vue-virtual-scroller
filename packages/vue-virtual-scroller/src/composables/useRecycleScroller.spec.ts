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

function mountHarness(overrides: Partial<{
  items: Array<Record<string, unknown>>
  itemSize: number | null
  minItemSize: number | null
  sizeField: string
  shift: boolean
  cache: any
}> = {}) {
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
    shift: false,
    cache: undefined,
    prerender: 0,
    emitUpdate: true,
    updateInterval: 0,
    ...overrides,
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
  const el = (wrapper.vm as any).el as HTMLElement
  Object.defineProperty(el, 'clientHeight', {
    configurable: true,
    get: () => 100,
  })
  Object.defineProperty(el, 'clientWidth', {
    configurable: true,
    get: () => 100,
  })
  el.scrollTo = vi.fn(({ top, left }: ScrollToOptions & { top?: number, left?: number }) => {
    if (typeof top === 'number') {
      el.scrollTop = top
    }
    if (typeof left === 'number') {
      el.scrollLeft = left
    }
  }) as any

  return {
    wrapper,
    vm: wrapper.vm as any,
    onUpdate,
    options,
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

  it('supports aligned scrolling and offset lookup helpers', async () => {
    const { vm } = mountHarness({
      items: Array.from({ length: 20 }, (_, id) => ({ id })),
    })

    await nextTick()
    await nextTick()

    vm.scrollToItem(15, { align: 'end' })
    expect(vm.el.scrollTop).toBe(60)
    expect(vm.getItemOffset(4)).toBe(40)
    expect(vm.getItemSize(4)).toBe(10)
    expect(vm.findItemIndex(34)).toBe(3)

    vm.el.scrollTop = 20
    vm.scrollToItem(2, { align: 'nearest' })
    expect(vm.el.scrollTop).toBe(20)
  })

  it('keeps the viewport anchored when prepending items with shift enabled', async () => {
    const { vm, options } = mountHarness({
      items: [{ id: 1 }, { id: 2 }, { id: 3 }],
      shift: true,
    })

    await nextTick()
    await nextTick()

    vm.el.scrollTop = 20
    options.items = [{ id: 0 }, ...options.items]
    await nextTick()

    expect(vm.el.scrollTop).toBe(30)
  })

  it('does not adjust scroll when prepending items without shift', async () => {
    const { vm, options } = mountHarness({
      items: [{ id: 1 }, { id: 2 }, { id: 3 }],
      shift: false,
    })

    await nextTick()
    await nextTick()

    vm.el.scrollTop = 20
    options.items = [{ id: 0 }, ...options.items]
    await nextTick()

    expect(vm.el.scrollTop).toBe(20)
  })

  it('builds and restores cache snapshots for variable-size lists', async () => {
    const { vm, options } = mountHarness({
      items: [
        { id: 'a', size: 15 },
        { id: 'b', size: 25 },
      ],
      itemSize: null,
      minItemSize: 10,
    })

    await nextTick()
    await nextTick()

    const snapshot = vm.cacheSnapshot

    expect(snapshot).toEqual({
      keys: ['a', 'b'],
      sizes: [15, 25],
    })
    expect(vm.getItemOffset(1)).toBe(15)

    options.items = [{ id: 'a' }, { id: 'b' }]
    await nextTick()

    expect(vm.getItemOffset(1)).toBe(10)
    expect(vm.restoreCache(snapshot)).toBe(true)
    await nextTick()
    expect(vm.getItemOffset(1)).toBe(15)

    expect(vm.restoreCache({
      keys: ['x', 'y'],
      sizes: [15, 25],
    })).toBe(false)
  })
})

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
  keyField: string | ((item: Record<string, unknown>, index: number) => string | number)
  direction: 'vertical' | 'horizontal'
  itemSize: number | null | ((item: Record<string, unknown>, index: number) => number)
  gridItems: number | undefined
  itemSecondarySize: number | undefined
  minItemSize: number | null
  sizeField: string
  shift: boolean
  cache: any
  disableTransform: boolean
  hiddenPosition: number
  updateInterval: number
  clientHeight: number
  clientWidth: number
}> = {}) {
  const onUpdate = vi.fn()
  const clientHeight = overrides.clientHeight ?? 100
  const clientWidth = overrides.clientWidth ?? 100
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
    disableTransform: false,
    hiddenPosition: undefined,
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
    get: () => clientHeight,
  })
  Object.defineProperty(el, 'clientWidth', {
    configurable: true,
    get: () => clientWidth,
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

  it('emits updates for large variable-size rows before scrolling a full minItemSize', async () => {
    const { vm, onUpdate } = mountHarness({
      items: [
        { id: 1, size: 300 },
        { id: 2, size: 300 },
        { id: 3, size: 300 },
      ],
      itemSize: null,
      minItemSize: 300,
    })

    await nextTick()
    await nextTick()

    expect(vm.visiblePool.map((view: View) => view.nr.index)).toEqual([0])
    onUpdate.mockClear()

    vm.el.scrollTop = 250
    vm.updateVisibleItems(false, true)

    expect(onUpdate).toHaveBeenCalledTimes(1)
    expect(vm.visiblePool.map((view: View) => view.nr.index)).toEqual([0, 1])
  })

  it('virtualizes grid items across the secondary axis and updates on horizontal scroll', async () => {
    const { vm } = mountHarness({
      items: Array.from({ length: 16 }, (_, id) => ({ id })),
      itemSize: 10,
      gridItems: 4,
      itemSecondarySize: 20,
      clientHeight: 25,
      clientWidth: 35,
    })

    await nextTick()
    await nextTick()

    expect(vm.visiblePool.map((view: View) => view.nr.index).sort((a: number, b: number) => a - b)).toEqual([0, 1, 4, 5, 8, 9])

    vm.el.scrollLeft = 20
    vm.updateVisibleItems(false)

    expect(vm.visiblePool.map((view: View) => view.nr.index).sort((a: number, b: number) => a - b)).toEqual([1, 2, 5, 6, 9, 10])
  })

  it('scrolls grid items into view on both axes', async () => {
    const { vm } = mountHarness({
      items: Array.from({ length: 16 }, (_, id) => ({ id })),
      itemSize: 10,
      gridItems: 4,
      itemSecondarySize: 20,
      clientHeight: 10,
      clientWidth: 35,
    })

    await nextTick()
    await nextTick()

    vm.scrollToItem(6, { align: 'start' })

    expect(vm.el.scrollTop).toBe(10)
    expect(vm.el.scrollLeft).toBe(40)
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

  it('supports function keyField for cache snapshots and shift anchoring', async () => {
    const keyField = (item: { threadId: string, id: number }) => `${item.threadId}:${item.id}`
    const { vm, options } = mountHarness({
      items: [
        { threadId: 'general', id: 1, size: 10 },
        { threadId: 'general', id: 2, size: 10 },
        { threadId: 'general', id: 3, size: 10 },
      ],
      itemSize: null,
      minItemSize: 10,
      keyField,
      shift: true,
    } as any)

    await nextTick()
    await nextTick()

    expect(vm.cacheSnapshot.keys).toEqual(['general:1', 'general:2', 'general:3'])

    const initialView = vm.visiblePool.find((view: View) => view.nr.key === 'general:2')
    const initialViewId = initialView.nr.id

    options.items = [
      { threadId: 'general', id: 1, size: 10, label: 'updated' },
      { threadId: 'general', id: 2, size: 10 },
      { threadId: 'general', id: 3, size: 10 },
    ]
    await nextTick()

    expect(vm.visiblePool.find((view: View) => view.nr.key === 'general:2').nr.id).toBe(initialViewId)

    vm.el.scrollTop = 20
    options.items = [
      { threadId: 'general', id: 0, size: 10 },
      ...options.items,
    ]
    await nextTick()

    expect(vm.el.scrollTop).toBe(30)
    expect(vm.restoreCache(vm.cacheSnapshot)).toBe(true)
  })

  it('supports function itemSize for variable-size math and scrolling', async () => {
    const itemSize = (item: Record<string, unknown>, index: number) => Number(item.size ?? ((index + 1) * 10))
    const { vm } = mountHarness({
      items: [
        { id: 'a', size: 15 },
        { id: 'b', size: 25 },
        { id: 'c', size: 35 },
        { id: 'd', size: 45 },
      ],
      itemSize,
      minItemSize: 10,
    })

    await nextTick()
    await nextTick()

    expect(vm.getItemSize(2)).toBe(35)
    expect(vm.getItemOffset(2)).toBe(40)
    expect(vm.findItemIndex(41)).toBe(2)

    vm.scrollToItem(2, { align: 'start' })

    expect(vm.el.scrollTop).toBe(40)
  })

  it('builds and restores cache snapshots for function itemSize', async () => {
    const itemSize = (item: Record<string, unknown>) => Number(item.size || 0)
    const { vm, options } = mountHarness({
      items: [
        { id: 'a', size: 15 },
        { id: 'b', size: 25 },
      ],
      itemSize,
      minItemSize: 10,
    })

    await nextTick()
    await nextTick()

    const snapshot = vm.cacheSnapshot

    expect(snapshot).toEqual({
      keys: ['a', 'b'],
      sizes: [15, 25],
    })

    options.items = [{ id: 'a' }, { id: 'b' }]
    await nextTick()

    expect(vm.getItemOffset(1)).toBe(10)
    expect(vm.restoreCache(snapshot)).toBe(true)
    await nextTick()
    expect(vm.getItemOffset(1)).toBe(15)
  })

  it('rejects grid mode when itemSize is a function getter', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    mountHarness({
      items: Array.from({ length: 4 }, (_, id) => ({ id, size: 20 })),
      itemSize: item => Number(item.size || 0),
      minItemSize: 20,
      gridItems: 2,
    })

    expect(consoleErrorSpy).toHaveBeenCalledWith('[vue-recycle-scroller] You must provide an itemSize when using gridItems')

    consoleErrorSpy.mockRestore()
  })

  it('builds transform styles by default', async () => {
    const { vm } = mountHarness()

    await nextTick()
    await nextTick()

    const style = vm.getViewStyle(vm.pool[0])
    expect(style.transform).toBe('translateY(0px) translateX(0px)')
    expect(style.top).toBe('0px')
    expect(style.left).toBe('0px')
    expect(style.willChange).toBe('transform')
  })

  it('uses top and left when disableTransform is enabled', async () => {
    const { vm } = mountHarness({
      disableTransform: true,
    })

    await nextTick()
    await nextTick()

    const view = vm.pool[0]
    view.position = 40
    view.offset = 12

    const style = vm.getViewStyle(view)
    expect(style.top).toBe('40px')
    expect(style.left).toBe('12px')
    expect(style.transform).toBe('none')
    expect(style.willChange).toBe('unset')
  })

  it('keeps fixed-grid secondary axis placement in disableTransform mode', async () => {
    const { vm } = mountHarness({
      items: Array.from({ length: 16 }, (_, id) => ({ id })),
      itemSize: 10,
      gridItems: 4,
      itemSecondarySize: 20,
      disableTransform: true,
    })

    await nextTick()
    await nextTick()

    const targetView = vm.pool.find((view: View) => view.nr.index === 1)
    const style = vm.getViewStyle(targetView)
    expect(style.top).toBe('0px')
    expect(style.left).toBe('20px')
    expect(style.width).toBe('20px')
    expect(style.height).toBe('10px')
  })

  it('uses the main axis for horizontal positioning styles', async () => {
    const { vm } = mountHarness({
      direction: 'horizontal',
      disableTransform: true,
    })

    await nextTick()
    await nextTick()

    const view = vm.pool[0]
    view.position = 40
    view.offset = 12

    const style = vm.getViewStyle(view)
    expect(style.left).toBe('40px')
    expect(style.top).toBe('12px')
    expect(style.transform).toBe('none')
  })

  it('parks recycled views at configured hidden position and keeps default fallback', async () => {
    const defaultHarness = mountHarness()
    const configuredHarness = mountHarness({
      hiddenPosition: -12345,
    })

    await nextTick()
    await nextTick()
    await configuredHarness.wrapper.vm.$nextTick()
    await configuredHarness.wrapper.vm.$nextTick()

    defaultHarness.options.items = []
    configuredHarness.options.items = []

    await nextTick()
    await configuredHarness.wrapper.vm.$nextTick()

    expect(defaultHarness.vm.pool.every((view: View) => !view.nr.used)).toBe(true)
    expect(defaultHarness.vm.pool.every((view: View) => view.position === -999999)).toBe(true)
    expect(configuredHarness.vm.pool.every((view: View) => !view.nr.used)).toBe(true)
    expect(configuredHarness.vm.pool.every((view: View) => view.position === -12345)).toBe(true)
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

  it('cancels pending animation frames on unmount', async () => {
    const requestAnimationFrameSpy = vi.spyOn(window, 'requestAnimationFrame')
    requestAnimationFrameSpy.mockImplementation(() => 123)
    const cancelAnimationFrameSpy = vi.spyOn(window, 'cancelAnimationFrame')

    const { wrapper, vm } = mountHarness()
    await nextTick()
    await nextTick()

    vm.handleVisibilityChange(true, {
      boundingClientRect: {
        width: 10,
        height: 10,
      },
    } as IntersectionObserverEntry)

    wrapper.unmount()

    expect(cancelAnimationFrameSpy).toHaveBeenCalledWith(123)

    requestAnimationFrameSpy.mockRestore()
    cancelAnimationFrameSpy.mockRestore()
  })

  it('clears pending timeouts on unmount', async () => {
    const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout')
    setTimeoutSpy.mockImplementation(() => 789 as unknown as ReturnType<typeof setTimeout>)
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout')

    const { wrapper, vm } = mountHarness({
      updateInterval: 10,
    })
    await nextTick()
    await nextTick()

    vm.handleScroll()

    wrapper.unmount()

    expect(clearTimeoutSpy).toHaveBeenCalledWith(789)

    setTimeoutSpy.mockRestore()
    clearTimeoutSpy.mockRestore()
  })
})

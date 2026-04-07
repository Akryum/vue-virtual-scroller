import type { ItemWithSize, ScrollDirection, View } from '../types'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { computed, defineComponent, nextTick, reactive, ref, shallowReactive } from 'vue'
import { useDynamicScroller } from './useDynamicScroller'

function createMeasuredElement(initialHeight: number) {
  const el = document.createElement('div')
  el.setAttribute('data-height', String(initialHeight))

  Object.defineProperty(el, 'offsetHeight', {
    configurable: true,
    get() {
      return Number(el.getAttribute('data-height') || '0')
    },
  })

  Object.defineProperty(el, 'offsetWidth', {
    configurable: true,
    get() {
      return 240
    },
  })

  return el
}

function createScrollerElement() {
  const el = document.createElement('div')

  Object.defineProperty(el, 'clientHeight', {
    configurable: true,
    get() {
      return 180
    },
  })

  Object.defineProperty(el, 'clientWidth', {
    configurable: true,
    get() {
      return 180
    },
  })

  Object.defineProperty(el, 'scrollHeight', {
    configurable: true,
    get() {
      return 600
    },
  })

  el.scrollTop = 0
  el.scrollLeft = 0

  return el
}

function createSlotElement(scrollHeight: number) {
  const el = document.createElement('div')

  Object.defineProperty(el, 'scrollHeight', {
    configurable: true,
    get() {
      return scrollHeight
    },
  })

  return el
}

function createDynamicView(
  item: unknown,
  {
    index = 0,
    used = true,
  }: {
    index?: number
    used?: boolean
  } = {},
): View {
  const id = typeof item === 'object' && item && 'id' in item
    ? (item as any).id
    : index
  const itemWithSize: ItemWithSize = {
    item,
    id,
    size: undefined,
  }

  return shallowReactive({
    item: itemWithSize,
    position: index * 20,
    offset: 0,
    _vs_styleStamp: 0,
    nr: {
      id: index,
      index,
      used,
      key: id,
      type: 'default',
    },
  }) as View
}

function touchViewStyle(view: View) {
  ;((view as View & { _vs_styleStamp?: number })._vs_styleStamp) = (((view as View & { _vs_styleStamp?: number })._vs_styleStamp) ?? 0) + 1
}

function mountHarness(
  initialItems: unknown[],
  {
    beforeEl,
    afterEl,
    shift = false,
  }: {
    beforeEl?: HTMLElement
    afterEl?: HTMLElement
    shift?: boolean
  } = {},
) {
  const onResize = vi.fn()
  const onVisible = vi.fn()
  const onHidden = vi.fn()
  const onUpdate = vi.fn()

  const options = reactive({
    items: initialItems,
    keyField: 'id',
    direction: 'vertical' as ScrollDirection,
    minItemSize: 20,
    buffer: 200,
    emitUpdate: true,
    pageMode: false,
    shift,
    prerender: 0,
    updateInterval: 0,
  })

  const el = ref(createScrollerElement())
  const before = ref(beforeEl)
  const after = ref(afterEl)

  const Harness = defineComponent({
    setup() {
      const state = useDynamicScroller(computed(() => ({
        items: options.items,
        keyField: options.keyField,
        direction: options.direction,
        minItemSize: options.minItemSize,
        el: el.value,
        before: before.value,
        after: after.value,
        buffer: options.buffer,
        emitUpdate: options.emitUpdate,
        pageMode: options.pageMode,
        shift: options.shift,
        prerender: options.prerender,
        updateInterval: options.updateInterval,
        onResize,
        onVisible,
        onHidden,
        onUpdate,
      })))

      return {
        ...state,
        options,
        el,
        before,
        after,
      }
    },
    template: '<div />',
  })

  const wrapper = mount(Harness)
  return {
    wrapper,
    vm: wrapper.vm as any,
    options,
    el,
    before,
    after,
    onResize,
    onVisible,
    onHidden,
    onUpdate,
  }
}

describe('useDynamicScroller', () => {
  let originalResizeObserver: typeof globalThis.ResizeObserver

  beforeEach(() => {
    originalResizeObserver = globalThis.ResizeObserver
    ;(globalThis as any).ResizeObserver = undefined
  })

  afterEach(() => {
    ;(globalThis as any).ResizeObserver = originalResizeObserver
  })

  it('exposes merged virtualization state and helpers', async () => {
    const items = [
      { id: 'a', label: 'Alpha' },
      { id: 'b', label: 'Beta' },
      { id: 'c', label: 'Gamma' },
    ]
    const { vm, el } = mountHarness(items)

    await nextTick()
    await nextTick()

    expect(vm.itemsWithSize).toHaveLength(3)
    expect(vm.itemsWithSize[0].id).toBe('a')
    expect(vm.itemsWithSize[0].size).toBe(0)
    expect(vm.measurementContext.vscrollData).toBe(vm.vscrollData)
    expect(vm.measurementContext.direction.value).toBe('vertical')
    expect(vm.pool.length).toBeGreaterThan(0)
    expect(vm.visiblePool.length).toBeGreaterThan(0)
    expect(vm.totalSize).toBe(60)
    expect(vm.ready).toBe(true)
    expect(typeof vm.handleScroll).toBe('function')
    expect(typeof vm.handleResize).toBe('function')
    expect(typeof vm.handleVisibilityChange).toBe('function')
    expect(typeof vm.scrollToPosition).toBe('function')
    expect(typeof vm.vDynamicScrollerItem.mounted).toBe('function')
    expect(vm.visiblePool.map((view: any) => view.nr.index)).toEqual([0, 1, 2])

    vm.scrollToItem(2)
    expect(el.value.scrollTop).toBe(40)

    vm.scrollToPosition(55)
    expect(el.value.scrollTop).toBe(55)

    vm.vscrollData.sizes.a = 42
    await nextTick()

    expect(vm.getItemSize(items[0])).toBe(42)
  })

  it('uses minItemSize for initial scroll math and measured sizes for later scrolls', async () => {
    const items = [
      { id: 'a', label: 'Alpha' },
      { id: 'b', label: 'Beta' },
      { id: 'c', label: 'Gamma' },
    ]
    const { vm, el } = mountHarness(items)

    await nextTick()
    await nextTick()

    vm.scrollToItem(2)
    expect(el.value.scrollTop).toBe(40)

    vm.vscrollData.sizes.a = 44
    vm.vscrollData.sizes.b = 88
    await nextTick()

    vm.scrollToItem(2)
    expect(el.value.scrollTop).toBe(132)
  })

  it('forwards resize, visible, hidden, and update callbacks through the merged composable', async () => {
    const { vm, onResize, onVisible, onHidden, onUpdate } = mountHarness([
      { id: 'a' },
      { id: 'b' },
    ])

    await nextTick()
    await nextTick()

    expect(onUpdate).toHaveBeenCalled()

    vm.handleResize()
    expect(onResize).toHaveBeenCalledTimes(1)

    vm.handleVisibilityChange(true, {
      boundingClientRect: {
        width: 10,
        height: 10,
      },
    })
    expect(onVisible).toHaveBeenCalledTimes(1)

    vm.handleVisibilityChange(false, {
      boundingClientRect: {
        width: 0,
        height: 0,
      },
    })
    expect(onHidden).toHaveBeenCalledTimes(1)
  })

  it('adjusts scroll position when measured sizes change above the viewport', async () => {
    const { vm, el } = mountHarness([
      { id: 'a', label: 'Alpha' },
      { id: 'b', label: 'Beta' },
      { id: 'c', label: 'Gamma' },
    ])

    await nextTick()
    await nextTick()

    el.value.scrollTop = 25
    vm.vscrollData.sizes.a = 40
    await nextTick()

    expect(el.value.scrollTop).toBe(45)
  })

  it('keeps the same anchor row in place while prepended items are measured with shift enabled', async () => {
    const initialItems = [
      { id: 'a', label: 'Alpha' },
      { id: 'b', label: 'Beta' },
      { id: 'c', label: 'Gamma' },
      { id: 'd', label: 'Delta' },
      { id: 'e', label: 'Epsilon' },
    ]
    const { vm, el, options } = mountHarness(initialItems, {
      shift: true,
    })

    await nextTick()
    await nextTick()

    el.value.scrollTop = 25
    vm.updateVisibleItems(false)
    const initialAnchorIndex = vm.findItemIndex(el.value.scrollTop)
    const initialAnchorId = vm.itemsWithSize[initialAnchorIndex].id
    const initialAnchorOffset = el.value.scrollTop - vm.getItemOffset(initialAnchorIndex)

    options.items = [
      { id: 'x', label: 'Prepended X' },
      { id: 'y', label: 'Prepended Y' },
      ...initialItems,
    ]
    await nextTick()

    expect(el.value.scrollTop).toBe(65)
    expect(vm.itemsWithSize[vm.findItemIndex(el.value.scrollTop)].id).toBe(initialAnchorId)
    expect(el.value.scrollTop - vm.getItemOffset(vm.findItemIndex(el.value.scrollTop))).toBe(initialAnchorOffset)

    vm.vscrollData.sizes.x = 35
    vm.vscrollData.sizes.y = 30
    await nextTick()

    expect(el.value.scrollTop).toBe(90)
    expect(vm.itemsWithSize[vm.findItemIndex(el.value.scrollTop)].id).toBe(initialAnchorId)
    expect(el.value.scrollTop - vm.getItemOffset(vm.findItemIndex(el.value.scrollTop))).toBe(initialAnchorOffset)
  })

  it('handles simple-array mode and clears sizes on direction change', async () => {
    const { vm, options } = mountHarness(['one', 'two'])

    await nextTick()
    await nextTick()

    expect(vm.simpleArray).toBe(true)
    expect(vm.itemsWithSize[1].id).toBe(1)

    vm.vscrollData.sizes[1] = 30
    expect(vm.getItemSize('two')).toBe(30)

    options.direction = 'horizontal'
    await nextTick()

    expect(Object.keys(vm.vscrollData.sizes)).toHaveLength(0)
  })

  it('forwards before and after slot offsets to the virtualization engine', async () => {
    const beforeEl = createSlotElement(40)
    const afterEl = createSlotElement(60)
    const items = Array.from({ length: 20 }, (_, index) => ({ id: `row-${index}` }))
    const withSlots = mountHarness(items, {
      beforeEl,
      afterEl,
    })
    const withoutSlots = mountHarness(items)

    withSlots.options.buffer = 0
    withoutSlots.options.buffer = 0
    withSlots.el.value.scrollTop = 60
    withoutSlots.el.value.scrollTop = 60

    await nextTick()
    await nextTick()

    withSlots.onUpdate.mockClear()
    withoutSlots.onUpdate.mockClear()

    withSlots.vm.updateVisibleItems(false)
    withoutSlots.vm.updateVisibleItems(false)

    const withSlotRange = withSlots.onUpdate.mock.lastCall!
    const withoutSlotRange = withoutSlots.onUpdate.mock.lastCall!

    expect(withSlotRange[0]).toBeLessThan(withoutSlotRange[0])
    expect(withSlotRange[2]).toBeLessThan(withoutSlotRange[2])
    expect(withSlotRange[3]).toBeGreaterThan(withoutSlotRange[3])

    withSlots.wrapper.unmount()
    withoutSlots.wrapper.unmount()
  })

  it('measures an element on mount and recomputes when sizeDependencies change', async () => {
    const { wrapper, vm } = mountHarness([{ id: 'row-1', text: 'Alpha' }])
    const el = createMeasuredElement(44)

    vm.vDynamicScrollerItem.mounted(el, {
      value: {
        view: createDynamicView({ id: 'row-1', text: 'Alpha' }),
        sizeDependencies: ['Alpha'],
      },
    } as any)

    await nextTick()
    await nextTick()

    expect(vm.vscrollData.sizes['row-1']).toBe(44)

    el.setAttribute('data-height', '88')
    vm.vDynamicScrollerItem.updated(el, {
      value: {
        view: createDynamicView({ id: 'row-1', text: 'Alpha updated' }),
        sizeDependencies: ['Alpha updated'],
      },
      oldValue: {
        view: createDynamicView({ id: 'row-1', text: 'Alpha' }),
        sizeDependencies: ['Alpha'],
      },
    } as any)

    await nextTick()
    await nextTick()

    expect(vm.vscrollData.sizes['row-1']).toBe(88)
    wrapper.unmount()
  })

  it('applies recycled view styles automatically for generic elements', async () => {
    const { wrapper, vm } = mountHarness([{ id: 'row-1', text: 'Alpha' }])
    const el = createMeasuredElement(44)

    vm.vDynamicScrollerItem.mounted(el, {
      value: {
        view: createDynamicView({ id: 'row-1', text: 'Alpha' }, { index: 2 }),
      },
    } as any)

    expect(el.style.position).toBe('absolute')
    expect(el.style.top).toBe('0px')
    expect(el.style.left).toBe('0px')
    expect(el.style.transform).toBe('translateY(40px) translateX(0px)')
    expect(el.style.visibility).toBe('visible')
    expect(el.style.pointerEvents).toBe('')
    expect(el.style.willChange).toBe('transform')

    vm.vDynamicScrollerItem.updated(el, {
      value: {
        view: createDynamicView({ id: 'row-1', text: 'Alpha' }, { index: 3, used: false }),
      },
    } as any)

    expect(el.style.transform).toBe('translateY(60px) translateX(0px)')
    expect(el.style.visibility).toBe('hidden')
    expect(el.style.pointerEvents).toBe('none')

    vm.vDynamicScrollerItem.unmounted(el)

    expect(el.style.position).toBe('')
    expect(el.style.transform).toBe('')
    expect(el.style.visibility).toBe('')
    wrapper.unmount()
  })

  it('keeps generic element styles in sync when a pooled view moves without a directive update', async () => {
    const { wrapper, vm } = mountHarness([{ id: 'row-1', text: 'Alpha' }])
    const el = createMeasuredElement(44)
    const view = createDynamicView({ id: 'row-1', text: 'Alpha' }, { index: 1 })

    vm.vDynamicScrollerItem.mounted(el, {
      value: {
        view,
      },
    } as any)

    expect(el.style.transform).toBe('translateY(20px) translateX(0px)')

    view.position = 180
    view.offset = 12
    await nextTick()

    expect(el.style.transform).toBe('translateY(180px) translateX(12px)')
    wrapper.unmount()
  })

  it('keeps pooled visibility styles in sync when a view is recycled without a directive update', async () => {
    const { wrapper, vm } = mountHarness([{ id: 'row-1', text: 'Alpha' }])
    const el = createMeasuredElement(44)
    const view = createDynamicView({ id: 'row-1', text: 'Alpha' })

    vm.vDynamicScrollerItem.mounted(el, {
      value: {
        view,
      },
    } as any)

    expect(el.style.visibility).toBe('visible')

    view.nr.used = false
    touchViewStyle(view)
    await nextTick()

    expect(el.style.visibility).toBe('hidden')
    expect(el.style.pointerEvents).toBe('none')

    view.nr.used = true
    view.position = 60
    touchViewStyle(view)
    await nextTick()

    expect(el.style.visibility).toBe('visible')
    expect(el.style.pointerEvents).toBe('')
    expect(el.style.transform).toBe('translateY(60px) translateX(0px)')
    wrapper.unmount()
  })

  it('uses top positioning automatically for table rows', async () => {
    const { wrapper, vm } = mountHarness([{ id: 'row-1', text: 'Alpha' }])
    const el = document.createElement('tr')

    Object.defineProperty(el, 'offsetHeight', {
      configurable: true,
      get() {
        return 44
      },
    })

    Object.defineProperty(el, 'offsetWidth', {
      configurable: true,
      get() {
        return 240
      },
    })

    vm.vDynamicScrollerItem.mounted(el, {
      value: {
        view: createDynamicView({ id: 'row-1', text: 'Alpha' }, { index: 2 }),
      },
    } as any)

    expect(el.style.position).toBe('absolute')
    expect(el.style.top).toBe('40px')
    expect(el.style.left).toBe('0px')
    expect(el.style.transform).toBe('')
    expect(el.style.willChange).toBe('unset')
    wrapper.unmount()
  })

  it('handles recycled DOM rebinding without losing item sizing', async () => {
    const { wrapper, vm } = mountHarness([
      { id: 'row-1', text: 'Alpha' },
      { id: 'row-2', text: 'Beta' },
    ])
    const el = createMeasuredElement(40)

    vm.vDynamicScrollerItem.mounted(el, {
      value: {
        view: createDynamicView({ id: 'row-1', text: 'Alpha' }),
        sizeDependencies: ['Alpha'],
      },
    } as any)

    await nextTick()
    await nextTick()

    el.setAttribute('data-height', '72')
    vm.vDynamicScrollerItem.updated(el, {
      value: {
        view: createDynamicView({ id: 'row-2', text: 'Beta' }, { index: 1 }),
        sizeDependencies: ['Beta'],
      },
    } as any)

    await nextTick()
    await nextTick()

    expect(vm.vscrollData.sizes['row-1']).toBe(40)
    expect(vm.vscrollData.sizes['row-2']).toBe(72)
    wrapper.unmount()
  })

  it('does not copy the previous item size onto a recycled binding before remeasurement', async () => {
    const { wrapper, vm } = mountHarness([
      { id: 'row-1', text: 'Alpha' },
      { id: 'row-2', text: 'Beta' },
    ])
    const el = createMeasuredElement(40)

    vm.vDynamicScrollerItem.mounted(el, {
      value: {
        view: createDynamicView({ id: 'row-1', text: 'Alpha' }),
        sizeDependencies: ['Alpha'],
      },
    } as any)

    await nextTick()
    await nextTick()

    el.setAttribute('data-height', '72')
    vm.vDynamicScrollerItem.updated(el, {
      value: {
        view: createDynamicView({ id: 'row-2', text: 'Beta' }, { index: 1 }),
        sizeDependencies: ['Beta'],
      },
    } as any)

    await nextTick()

    expect(vm.vscrollData.sizes['row-1']).toBe(40)
    expect(vm.vscrollData.sizes['row-2']).not.toBe(40)

    await nextTick()

    expect(vm.vscrollData.sizes['row-2']).toBe(72)
    wrapper.unmount()
  })

  it('supports simple-array measurement when index is provided', async () => {
    const { wrapper, vm } = mountHarness(['Alpha'])
    const el = createMeasuredElement(31)

    vm.vDynamicScrollerItem.mounted(el, {
      value: {
        view: createDynamicView('Alpha'),
        sizeDependencies: ['Alpha'],
      },
    } as any)

    await nextTick()
    await nextTick()

    expect(vm.vscrollData.sizes[0]).toBe(31)
    wrapper.unmount()
  })

  it('keeps scrolling to the end until undefined sizes are resolved', async () => {
    const requestAnimationFrameSpy = vi.spyOn(window, 'requestAnimationFrame')
    const frames: FrameRequestCallback[] = []
    requestAnimationFrameSpy.mockImplementation((callback: FrameRequestCallback) => {
      frames.push(callback)
      return frames.length
    })

    const { vm, el } = mountHarness([{ id: 'row-1' }])
    vm.measurementContext.undefinedSizeCount.value = 1

    vm.scrollToBottom()
    await nextTick()

    expect(el.value.scrollTop).toBe(5600)
    expect(frames).toHaveLength(1)

    const firstFrame = frames.shift()!
    firstFrame(0)
    expect(el.value.scrollTop).toBe(5600)
    expect(frames).toHaveLength(1)

    vm.measurementContext.undefinedSizeCount.value = 0
    const settleFrame = frames.shift()!
    settleFrame(16)

    expect(el.value.scrollTop).toBe(5600)
    expect(frames).toHaveLength(0)

    requestAnimationFrameSpy.mockRestore()
  })

  it('cleans up resize bindings on unmount', async () => {
    class FakeResizeObserver {
      observe = vi.fn()
      unobserve = vi.fn()
      disconnect = vi.fn()
      constructor(_callback: ResizeObserverCallback) {}
    }

    ;(globalThis as any).ResizeObserver = FakeResizeObserver

    const { wrapper, vm } = mountHarness([{ id: 'row-1', text: 'Alpha' }])
    const el = createMeasuredElement(48)

    vm.vDynamicScrollerItem.mounted(el, {
      value: {
        view: createDynamicView({ id: 'row-1', text: 'Alpha' }),
      },
    } as any)

    expect((el as any).$_vs_onResize).toBeTypeOf('function')

    vm.vDynamicScrollerItem.unmounted(el)

    expect((el as any).$_vs_onResize).toBeUndefined()
    expect(el.style.position).toBe('')
    wrapper.unmount()
  })

  it('updates measured sizes from ResizeObserver entries when available', async () => {
    let resizeObserverCallback: ResizeObserverCallback | undefined

    class FakeResizeObserver {
      observe = vi.fn()
      unobserve = vi.fn()
      disconnect = vi.fn()

      constructor(callback: ResizeObserverCallback) {
        resizeObserverCallback = callback
      }
    }

    ;(globalThis as any).ResizeObserver = FakeResizeObserver
    const requestAnimationFrameSpy = vi.spyOn(window, 'requestAnimationFrame')
    requestAnimationFrameSpy.mockImplementation((callback: FrameRequestCallback) => {
      callback(0)
      return 1
    })

    const { wrapper, vm } = mountHarness([{ id: 'row-1', text: 'Alpha' }])
    const el = createMeasuredElement(48)

    vm.vDynamicScrollerItem.mounted(el, {
      value: {
        view: createDynamicView({ id: 'row-1', text: 'Alpha' }),
      },
    } as any)

    expect(vm.resizeObserver).toBeInstanceOf(FakeResizeObserver)
    expect((vm.resizeObserver as FakeResizeObserver).observe).toHaveBeenCalledWith(el)

    resizeObserverCallback?.([{
      target: el,
      contentRect: {
        width: 240,
        height: 64,
      },
    } as unknown as ResizeObserverEntry], vm.resizeObserver as ResizeObserver)

    expect(vm.vscrollData.sizes['row-1']).toBe(64)

    requestAnimationFrameSpy.mockRestore()
    wrapper.unmount()
  })

  it('cancels pending animation frames on unmount', async () => {
    const requestAnimationFrameSpy = vi.spyOn(window, 'requestAnimationFrame')
    requestAnimationFrameSpy.mockImplementation(() => 456)
    const cancelAnimationFrameSpy = vi.spyOn(window, 'cancelAnimationFrame')

    const { wrapper, vm } = mountHarness([{ id: 'row-1' }])
    await nextTick()

    vm.scrollToBottom()
    await nextTick()

    wrapper.unmount()

    expect(cancelAnimationFrameSpy).toHaveBeenCalledWith(456)

    requestAnimationFrameSpy.mockRestore()
    cancelAnimationFrameSpy.mockRestore()
  })
})

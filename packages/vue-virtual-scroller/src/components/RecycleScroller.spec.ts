import type { CacheSnapshot } from '../types'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { computed, defineComponent, h, nextTick, ref } from 'vue'
import { getPooledViewStyle } from '../utils/viewStyle'
import RecycleScroller from './RecycleScroller.vue'

const mocks = vi.hoisted(() => {
  return {
    useRecycleScroller: vi.fn(),
    scrollToItem: vi.fn(),
    scrollToPosition: vi.fn(),
    getScroll: vi.fn(),
    findItemIndex: vi.fn(),
    getItemOffset: vi.fn(),
    getItemSize: vi.fn(),
    restoreCache: vi.fn(),
    updateVisibleItems: vi.fn(),
    handleScroll: vi.fn(),
    handleResize: vi.fn(),
    handleVisibilityChange: vi.fn(),
  }
})

vi.mock('../composables/useRecycleScroller', () => {
  return {
    useRecycleScroller: mocks.useRecycleScroller,
  }
})

const ResizeObserverStub = defineComponent({
  name: 'ResizeObserver',
  emits: ['notify'],
  setup(_props, { emit }) {
    return () => h('button', {
      class: 'resize-observer-notify',
      type: 'button',
      onClick: () => emit('notify'),
    })
  },
})

describe('recycleScroller', () => {
  beforeEach(() => {
    mocks.useRecycleScroller.mockReset()
    mocks.scrollToItem.mockReset()
    mocks.scrollToPosition.mockReset()
    mocks.getScroll.mockReset()
    mocks.findItemIndex.mockReset()
    mocks.getItemOffset.mockReset()
    mocks.getItemSize.mockReset()
    mocks.restoreCache.mockReset()
    mocks.updateVisibleItems.mockReset()
    mocks.handleScroll.mockReset()
    mocks.handleResize.mockReset()
    mocks.handleVisibilityChange.mockReset()

    mocks.getScroll.mockReturnValue({ start: 0, end: 80 })
    mocks.findItemIndex.mockReturnValue(2)
    mocks.getItemOffset.mockReturnValue(120)
    mocks.getItemSize.mockReturnValue(30)
    mocks.restoreCache.mockReturnValue(true)
    mocks.updateVisibleItems.mockReturnValue({ continuous: true })

    const cacheSnapshot: CacheSnapshot = {
      keys: ['a'],
      sizes: [20],
    }

    mocks.useRecycleScroller.mockImplementation((_options, _el, _before, _after, callbacks) => {
      return {
        pool: ref([{
          item: { id: 'a', label: 'Alpha' },
          position: 40,
          offset: 12,
          nr: {
            id: 1,
            index: 0,
            used: true,
            key: 'a',
            type: 'default',
          },
        }]),
        totalSize: ref(320),
        ready: ref(true),
        sizes: computed(() => []),
        simpleArray: computed(() => false),
        scrollToItem: (index: number, scrollOptions?: unknown) => mocks.scrollToItem(index, scrollOptions),
        scrollToPosition: (position: number, scrollOptions?: unknown) => mocks.scrollToPosition(position, scrollOptions),
        getScroll: () => mocks.getScroll(),
        findItemIndex: (offset: number) => mocks.findItemIndex(offset),
        getItemOffset: (index: number) => mocks.getItemOffset(index),
        getItemSize: (index: number) => mocks.getItemSize(index),
        getViewStyle: (view: any) => getPooledViewStyle(view, {
          direction: _options.direction,
          disableTransform: _options.disableTransform,
          itemSize: _options.itemSize,
          gridItems: _options.gridItems,
          itemSecondarySize: _options.itemSecondarySize,
        }),
        cacheSnapshot: computed(() => cacheSnapshot),
        restoreCache: (snapshot: CacheSnapshot | null | undefined) => mocks.restoreCache(snapshot),
        updateVisibleItems: (itemsChanged: boolean, checkPositionDiff?: boolean) =>
          mocks.updateVisibleItems(itemsChanged, checkPositionDiff),
        handleScroll: () => mocks.handleScroll(),
        handleResize: () => {
          mocks.handleResize()
          callbacks?.onResize?.()
        },
        handleVisibilityChange: (isVisible: boolean, entry: IntersectionObserverEntry) => {
          mocks.handleVisibilityChange(isVisible, entry)
          if (isVisible)
            callbacks?.onVisible?.()
          else
            callbacks?.onHidden?.()
        },
        sortViews: vi.fn(),
      }
    })
  })

  it('renders slots and forwards default slot props from pool views', async () => {
    const wrapper = mount(RecycleScroller, {
      props: {
        items: [{ id: 'a' }],
        itemSize: 20,
      },
      slots: {
        before: () => h('div', { class: 'before-slot' }, 'before'),
        default: ({ item, index, active }: any) => h('div', { class: 'row' }, `${item.label}|${index}|${active}`),
        empty: () => h('div', { class: 'empty-slot' }, 'empty'),
        after: () => h('div', { class: 'after-slot' }, 'after'),
      },
      global: {
        stubs: {
          ResizeObserver: ResizeObserverStub,
        },
      },
    })

    await nextTick()

    expect(wrapper.classes()).toContain('vue-recycle-scroller')
    expect(wrapper.classes()).toContain('ready')
    expect(wrapper.classes()).toContain('direction-vertical')
    expect(wrapper.find('.before-slot').exists()).toBe(true)
    expect(wrapper.find('.after-slot').exists()).toBe(true)
    expect(wrapper.find('.empty-slot').exists()).toBe(false)
    expect(wrapper.find('.row').text()).toBe('Alpha|0|true')
    expect(wrapper.emitted('visible')).toHaveLength(1)

    const itemView = wrapper.get('.vue-recycle-scroller__item-view').element as HTMLElement
    expect(itemView.style.transform).toBe('translateY(40px) translateX(12px)')
    expect(itemView.style.top).toBe('0px')
    expect(itemView.style.left).toBe('0px')
    expect(itemView.style.willChange).toBe('transform')
  })

  it('renders empty slot only when items is empty', async () => {
    const wrapper = mount(RecycleScroller, {
      props: {
        items: [],
        itemSize: 20,
      },
      slots: {
        empty: () => h('div', { class: 'empty-slot' }, 'empty'),
      },
      global: {
        stubs: {
          ResizeObserver: ResizeObserverStub,
        },
      },
    })

    await nextTick()

    expect(wrapper.find('.empty-slot').exists()).toBe(true)
  })

  it('wires scroll/resize handlers and exposes composable methods', async () => {
    const wrapper = mount(RecycleScroller, {
      props: {
        items: [{ id: 'a' }],
        itemSize: 20,
      },
      global: {
        stubs: {
          ResizeObserver: ResizeObserverStub,
        },
      },
    })
    const vm = wrapper.vm as any

    await wrapper.trigger('scroll')
    await wrapper.get('.resize-observer-notify').trigger('click')

    expect(mocks.handleScroll).toHaveBeenCalledTimes(1)
    expect(mocks.handleResize).toHaveBeenCalledTimes(1)
    expect(wrapper.emitted('resize')).toHaveLength(1)

    vm.scrollToItem(5, { align: 'center' })
    vm.scrollToPosition(180, { smooth: true })

    expect(mocks.scrollToItem).toHaveBeenCalledWith(5, { align: 'center' })
    expect(mocks.scrollToPosition).toHaveBeenCalledWith(180, { smooth: true })
    expect(vm.getScroll()).toEqual({ start: 0, end: 80 })
    expect(vm.findItemIndex(25)).toBe(2)
    expect(vm.getItemOffset(4)).toBe(120)
    expect(vm.getItemSize(4)).toBe(30)
    expect(vm.cacheSnapshot).toEqual({
      keys: ['a'],
      sizes: [20],
    })
    expect(vm.restoreCache(vm.cacheSnapshot)).toBe(true)
  })

  it('passes options to useRecycleScroller', () => {
    const cache = {
      keys: ['a'],
      sizes: [24],
    }
    const keyField = (item: { threadId: string, id: string }) => `${item.threadId}:${item.id}`
    mount(RecycleScroller, {
      props: {
        items: [{ threadId: 'general', id: 'a' }],
        direction: 'horizontal',
        keyField,
        listTag: 'ul',
        itemTag: 'li',
        itemSize: 30,
        buffer: 150,
        shift: true,
        cache,
      },
      global: {
        stubs: {
          ResizeObserver: ResizeObserverStub,
        },
      },
    })

    const [optionsArg] = mocks.useRecycleScroller.mock.calls[0]
    expect(optionsArg.direction).toBe('horizontal')
    expect(optionsArg.keyField).toBe(keyField)
    expect(optionsArg.listTag).toBe('ul')
    expect(optionsArg.itemTag).toBe('li')
    expect(optionsArg.itemSize).toBe(30)
    expect(optionsArg.buffer).toBe(150)
    expect(optionsArg.shift).toBe(true)
    expect(optionsArg.cache).toStrictEqual(cache)
  })

  it('uses top and left positioning when disableTransform is enabled', async () => {
    const wrapper = mount(RecycleScroller, {
      props: {
        items: [{ id: 'a' }],
        itemSize: 20,
        disableTransform: true,
      },
      global: {
        stubs: {
          ResizeObserver: ResizeObserverStub,
        },
      },
    })

    await nextTick()

    const itemView = wrapper.get('.vue-recycle-scroller__item-view').element as HTMLElement
    expect(itemView.style.top).toBe('40px')
    expect(itemView.style.left).toBe('12px')
    expect(itemView.style.transform).toBe('none')
    expect(itemView.style.willChange).toBe('unset')
  })
})

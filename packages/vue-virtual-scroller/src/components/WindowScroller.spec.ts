import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { computed, defineComponent, h, ref } from 'vue'
import { getPooledViewStyle } from '../utils/viewStyle'
import WindowScroller from './WindowScroller.vue'

const mocks = vi.hoisted(() => {
  return {
    useWindowScroller: vi.fn(),
    scrollToItem: vi.fn(),
    scrollToPosition: vi.fn(),
    restoreCache: vi.fn(),
  }
})

vi.mock('../composables/useWindowScroller', () => {
  return {
    useWindowScroller: mocks.useWindowScroller,
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

describe('windowScroller', () => {
  beforeEach(() => {
    mocks.useWindowScroller.mockReset()
    mocks.scrollToItem.mockReset()
    mocks.scrollToPosition.mockReset()
    mocks.restoreCache.mockReset()
    mocks.restoreCache.mockReturnValue(true)

    mocks.useWindowScroller.mockImplementation((_options, _el, _before, _after, callbacks) => {
      const fixedItemSize = typeof _options.itemSize === 'number' ? _options.itemSize : null
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
        totalSize: ref(240),
        ready: ref(true),
        sizes: computed(() => []),
        simpleArray: computed(() => false),
        scrollToItem: (index: number, scrollOptions?: unknown) => mocks.scrollToItem(index, scrollOptions),
        scrollToPosition: (position: number, scrollOptions?: unknown) => mocks.scrollToPosition(position, scrollOptions),
        getScroll: () => ({ start: 0, end: 80 }),
        findItemIndex: () => 1,
        getItemOffset: () => 40,
        getItemSize: () => 20,
        getViewStyle: (view: any) => getPooledViewStyle(view, {
          direction: _options.direction,
          disableTransform: _options.disableTransform,
          itemSize: fixedItemSize,
          gridItems: _options.gridItems,
          itemSecondarySize: _options.itemSecondarySize,
        }),
        cacheSnapshot: computed(() => ({ keys: ['a'], sizes: [20] })),
        restoreCache: (snapshot: unknown) => mocks.restoreCache(snapshot),
        updateVisibleItems: () => ({ continuous: true }),
        handleScroll: () => undefined,
        handleResize: () => callbacks?.onResize?.(),
        handleVisibilityChange: (isVisible: boolean) => {
          if (isVisible) {
            callbacks?.onVisible?.()
          }
          else {
            callbacks?.onHidden?.()
          }
        },
        sortViews: vi.fn(),
      }
    })
  })

  it('forwards props and exposes window-scroller methods', async () => {
    const cache = {
      keys: ['a'],
      sizes: [20],
    }

    const wrapper = mount(WindowScroller, {
      props: {
        items: [{ id: 'a' }],
        itemSize: 20,
        shift: true,
        cache,
        hiddenPosition: -456,
      },
      slots: {
        default: ({ item }: any) => h('div', { class: 'row' }, item.label),
      },
      global: {
        stubs: {
          ResizeObserver: ResizeObserverStub,
        },
      },
    })

    const vm = wrapper.vm as any
    vm.scrollToItem(3, { align: 'end' })
    vm.scrollToPosition(90, { smooth: true })

    expect(mocks.scrollToItem).toHaveBeenCalledWith(3, { align: 'end' })
    expect(mocks.scrollToPosition).toHaveBeenCalledWith(90, { smooth: true })
    expect(vm.cacheSnapshot).toEqual({
      keys: ['a'],
      sizes: [20],
    })
    expect(vm.restoreCache(vm.cacheSnapshot)).toBe(true)

    const [optionsArg] = mocks.useWindowScroller.mock.calls[0]
    expect(optionsArg.shift).toBe(true)
    expect(optionsArg.cache).toStrictEqual(cache)
    expect(optionsArg.hiddenPosition).toBe(-456)

    const itemView = wrapper.get('.vue-recycle-scroller__item-view').element as HTMLElement
    expect(itemView.style.transform).toBe('translateY(40px) translateX(12px)')
    expect(itemView.style.top).toBe('0px')
    expect(itemView.style.left).toBe('0px')
  })

  it('uses top and left positioning when disableTransform is enabled', async () => {
    const wrapper = mount(WindowScroller, {
      props: {
        items: [{ id: 'a' }],
        itemSize: 20,
        disableTransform: true,
      },
      slots: {
        default: ({ item }: any) => h('div', { class: 'row' }, item.label),
      },
      global: {
        stubs: {
          ResizeObserver: ResizeObserverStub,
        },
      },
    })

    const itemView = wrapper.get('.vue-recycle-scroller__item-view').element as HTMLElement
    expect(itemView.style.top).toBe('40px')
    expect(itemView.style.left).toBe('12px')
    expect(itemView.style.transform).toBe('none')
    expect(itemView.style.willChange).toBe('unset')
  })

  it('forwards function itemSize to useWindowScroller', () => {
    const itemSize = (item: unknown) => (item as { size: number }).size

    mount(WindowScroller, {
      props: {
        items: [{ id: 'a', size: 20 }],
        itemSize,
      },
      slots: {
        default: ({ item }: any) => h('div', { class: 'row' }, item.id),
      },
      global: {
        stubs: {
          ResizeObserver: ResizeObserverStub,
        },
      },
    })

    const [optionsArg] = mocks.useWindowScroller.mock.calls.at(-1)!
    expect(optionsArg.itemSize).toBe(itemSize)
  })
})

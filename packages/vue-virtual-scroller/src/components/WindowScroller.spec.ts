import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { computed, defineComponent, h, ref } from 'vue'
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
      return {
        pool: ref([{
          item: { id: 'a', label: 'Alpha' },
          position: 0,
          offset: 0,
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
  })
})

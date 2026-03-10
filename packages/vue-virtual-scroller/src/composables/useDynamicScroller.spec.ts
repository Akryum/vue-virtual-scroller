import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick, reactive, ref } from 'vue'
import { useDynamicScroller } from './useDynamicScroller'

function mountHarness(initialItems: unknown[]) {
  const scrollToItemSpy = vi.fn()
  const onResize = vi.fn()
  const onVisible = vi.fn()
  const options = reactive({
    items: initialItems,
    keyField: 'id',
    direction: 'vertical' as const,
    minItemSize: 20,
  })
  const scrollerRef = ref({
    scrollToItem: scrollToItemSpy,
  })
  const el = ref(document.createElement('div'))

  const Harness = defineComponent({
    setup() {
      const state = useDynamicScroller(options, scrollerRef, el, {
        onResize,
        onVisible,
      })
      return {
        ...state,
        options,
        el,
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
    scrollToItemSpy,
    onResize,
    onVisible,
  }
}

describe('useDynamicScroller', () => {
  it('builds itemsWithSize and exposes item size helpers', async () => {
    const items = [
      { id: 'a', label: 'Alpha' },
      { id: 'b', label: 'Beta' },
    ]
    const { vm, options } = mountHarness(items)

    expect(vm.itemsWithSize).toHaveLength(2)
    expect(vm.itemsWithSize[0].id).toBe('a')
    expect(vm.itemsWithSize[0].size).toBe(0)
    expect(vm.itemsWithSize[1].id).toBe('b')

    vm.vscrollData.sizes.a = 42
    await nextTick()

    expect(vm.getItemSize(options.items[0])).toBe(42)
  })

  it('handles simple-array mode and callback forwarding', () => {
    const { vm, onResize, onVisible } = mountHarness(['one', 'two'])

    expect(vm.simpleArray).toBe(true)
    expect(vm.itemsWithSize[1].id).toBe(1)

    vm.vscrollData.sizes[1] = 30
    expect(vm.getItemSize('two')).toBe(30)

    vm.onScrollerResize()
    vm.onScrollerVisible()

    expect(onResize).toHaveBeenCalledTimes(1)
    expect(onVisible).toHaveBeenCalledTimes(1)
  })

  it('forwards scrollToItem and clears sizes on direction change', async () => {
    const { vm, options, scrollToItemSpy } = mountHarness([
      { id: 'a' },
      { id: 'b' },
    ])

    vm.scrollToItem(4)
    expect(scrollToItemSpy).toHaveBeenCalledWith(4)

    vm.vscrollData.sizes.a = 10
    vm.vscrollData.sizes.b = 15
    expect(Object.keys(vm.vscrollData.sizes)).toHaveLength(2)

    options.direction = 'horizontal'
    await nextTick()

    expect(Object.keys(vm.vscrollData.sizes)).toHaveLength(0)
  })

  it('returns early on scrollToBottom when no scroller element is available', () => {
    const { vm, el } = mountHarness([{ id: 'a' }])
    el.value = undefined as any

    expect(() => vm.scrollToBottom()).not.toThrow()
  })
})

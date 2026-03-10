import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { computed } from 'vue'
import DynamicScrollerItem from './DynamicScrollerItem.vue'

const mocks = vi.hoisted(() => {
  return {
    useDynamicScrollerItem: vi.fn(),
  }
})

vi.mock('../composables/useDynamicScrollerItem', () => {
  return {
    useDynamicScrollerItem: mocks.useDynamicScrollerItem,
  }
})

describe('dynamicScrollerItem', () => {
  beforeEach(() => {
    mocks.useDynamicScrollerItem.mockReset()
    mocks.useDynamicScrollerItem.mockReturnValue({
      id: computed(() => 'row-1'),
      size: computed(() => 0),
      finalActive: computed(() => true),
      updateSize: vi.fn(),
    })
  })

  it('renders the configured tag and wires props to useDynamicScrollerItem', () => {
    const wrapper = mount(DynamicScrollerItem, {
      props: {
        item: { id: 'row-1' },
        active: true,
        watchData: true,
        emitResize: true,
        tag: 'section',
      },
      slots: {
        default: 'content',
      },
    })

    const [optionsArg, elRefArg] = mocks.useDynamicScrollerItem.mock.calls[0]

    expect(wrapper.element.tagName).toBe('SECTION')
    expect(wrapper.text()).toBe('content')
    expect(optionsArg.item).toEqual({ id: 'row-1' })
    expect(optionsArg.active).toBe(true)
    expect(optionsArg.watchData).toBe(true)
    expect(optionsArg.emitResize).toBe(true)
    expect(elRefArg).toHaveProperty('value')
  })

  it('re-emits resize from composable callbacks', () => {
    let onResize: ((id: string | number) => void) | undefined
    mocks.useDynamicScrollerItem.mockImplementation((_options, _el, callbacks) => {
      onResize = callbacks?.onResize
      return {
        id: computed(() => 'row-1'),
        size: computed(() => 0),
        finalActive: computed(() => true),
        updateSize: vi.fn(),
      }
    })

    const wrapper = mount(DynamicScrollerItem, {
      props: {
        item: { id: 'row-1' },
        active: true,
      },
    })

    onResize?.('row-1')

    expect(wrapper.emitted('resize')).toEqual([['row-1']])
  })
})

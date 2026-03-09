import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import DynamicScroller from './DynamicScroller.vue'

const scrollerScrollToItem = vi.fn()

const RecycleScrollerStub = defineComponent({
  name: 'RecycleScroller',
  props: {
    items: {
      type: Array,
      default: () => [],
    },
    minItemSize: {
      type: [Number, String],
      required: true,
    },
    direction: {
      type: String,
      default: 'vertical',
    },
    keyField: {
      type: String,
      default: 'id',
    },
    listTag: {
      type: String,
      default: 'div',
    },
    itemTag: {
      type: String,
      default: 'div',
    },
  },
  emits: ['resize', 'visible'],
  setup(props, { slots, emit, expose }) {
    const el = document.createElement('div')
    expose({
      el,
      scrollToItem: scrollerScrollToItem,
    })

    return () => h('div', { class: 'recycle-scroller-stub' }, [
      slots.before?.(),
      ...(props.items as unknown[]).map((item, index) => slots.default?.({
        item,
        index,
        active: index === 0,
      })),
      slots.empty?.(),
      slots.after?.(),
      h('button', {
        class: 'emit-resize',
        type: 'button',
        onClick: () => emit('resize'),
      }),
      h('button', {
        class: 'emit-visible',
        type: 'button',
        onClick: () => emit('visible'),
      }),
    ])
  },
})

function mountDynamicScroller(props: Record<string, unknown>, slots?: Record<string, unknown>) {
  return mount(DynamicScroller, {
    props,
    slots,
    global: {
      stubs: {
        RecycleScroller: RecycleScrollerStub,
      },
    },
  })
}

describe('DynamicScroller', () => {
  beforeEach(() => {
    scrollerScrollToItem.mockReset()
  })

  it('forwards slot bindings from itemWithSize', () => {
    const items = [
      { id: 'a', label: 'Alpha' },
      { id: 'b', label: 'Beta' },
    ]

    const wrapper = mountDynamicScroller(
      {
        items,
        minItemSize: 20,
      },
      {
        default: ({ item, index, active, itemWithSize }: any) => h('div', { class: 'row' }, `${item.label}|${index}|${active ? 'active' : 'inactive'}|${itemWithSize.id}`),
        before: () => h('div', { class: 'before-slot' }, 'before'),
        after: () => h('div', { class: 'after-slot' }, 'after'),
        empty: () => h('div', { class: 'empty-slot' }, 'empty'),
      },
    )

    const rows = wrapper.findAll('.row')
    expect(rows).toHaveLength(2)
    expect(rows[0].text()).toBe('Alpha|0|active|a')
    expect(rows[1].text()).toBe('Beta|1|inactive|b')
    expect(wrapper.find('.before-slot').exists()).toBe(true)
    expect(wrapper.find('.after-slot').exists()).toBe(true)
    expect(wrapper.find('.empty-slot').exists()).toBe(true)
  })

  it('passes props to RecycleScroller and re-emits resize and visible', async () => {
    const wrapper = mountDynamicScroller({
      items: [{ id: 1 }],
      minItemSize: 24,
      direction: 'horizontal',
      listTag: 'ul',
      itemTag: 'li',
    })

    const scroller = wrapper.getComponent({ name: 'RecycleScroller' })
    expect(scroller.props('minItemSize')).toBe(24)
    expect(scroller.props('direction')).toBe('horizontal')
    expect(scroller.props('listTag')).toBe('ul')
    expect(scroller.props('itemTag')).toBe('li')

    await scroller.get('.emit-resize').trigger('click')
    await scroller.get('.emit-visible').trigger('click')

    expect(wrapper.emitted('resize')).toHaveLength(1)
    expect(wrapper.emitted('visible')).toHaveLength(1)
  })

  it('exposes scrollToItem and getItemSize', () => {
    const items = [
      { id: 'a', label: 'Alpha' },
    ]
    const wrapper = mountDynamicScroller({
      items,
      minItemSize: 20,
    })
    const vm = wrapper.vm as any

    vm.scrollToItem(3)
    expect(scrollerScrollToItem).toHaveBeenCalledWith(3)
    expect(vm.getItemSize(items[0])).toBe(0)
  })
})

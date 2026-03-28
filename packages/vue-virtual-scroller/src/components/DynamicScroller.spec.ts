import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import DynamicScroller from './DynamicScroller.vue'

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
    Object.defineProperty(el, 'clientHeight', {
      configurable: true,
      get() {
        return 180
      },
    })
    el.scrollTop = 0
    expose({
      el,
    })

    return () => h('div', { class: 'recycle-scroller-stub' }, [
      slots.before?.(),
      ...(props.items as unknown[]).map((item, index) => slots.default?.({
        item,
        index,
        active: index === 0,
      })),
      ...(props.items as unknown[]).length === 0
        ? slots.empty?.() ?? []
        : [],
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

function mountDynamicScroller(props: any, slots?: any) {
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

describe('dynamicScroller', () => {
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
    expect(wrapper.find('.empty-slot').exists()).toBe(false)
  })

  it('renders empty slot only when items is empty', () => {
    const wrapper = mountDynamicScroller(
      {
        items: [],
        minItemSize: 20,
      },
      {
        empty: () => h('div', { class: 'empty-slot' }, 'empty'),
      },
    )

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

  it('exposes scrollToItem and getItemSize', async () => {
    const items = [
      { id: 'a', label: 'Alpha' },
      { id: 'b', label: 'Beta' },
      { id: 'c', label: 'Gamma' },
    ]
    const wrapper = mountDynamicScroller({
      items,
      minItemSize: 20,
    })
    const vm = wrapper.vm as any
    const scroller = wrapper.getComponent({ name: 'RecycleScroller' })

    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    vm.scrollToItem(2)
    expect((scroller.vm as any).$?.exposed?.el.scrollTop).toBe(40)
    expect(vm.getItemSize(items[0])).toBe(0)
  })

  it('keeps wrapped slot bindings aligned when the rendered items are replaced', async () => {
    const wrapper = mountDynamicScroller(
      {
        items: [
          { id: 'a', label: 'Alpha' },
          { id: 'b', label: 'Beta' },
        ],
        minItemSize: 20,
      },
      {
        default: ({ item, index, active, itemWithSize }: any) =>
          h('div', { class: 'row' }, `${item.label}|${index}|${active ? 'active' : 'inactive'}|${itemWithSize.id}`),
      },
    )

    await wrapper.setProps({
      items: [
        { id: 'c', label: 'Gamma' },
        { id: 'd', label: 'Delta' },
      ],
    })
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    const rows = wrapper.findAll('.row')
    expect(rows).toHaveLength(2)
    expect(rows[0].text()).toBe('Gamma|0|active|c')
    expect(rows[1].text()).toBe('Delta|1|inactive|d')
  })
})

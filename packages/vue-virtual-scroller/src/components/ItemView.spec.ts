import type { View } from '../types'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import ItemView from './ItemView.vue'

describe('itemView', () => {
  it('renders the configured tag and forwards slot props', () => {
    const view: View = {
      item: { label: 'Alpha' },
      position: 0,
      offset: 0,
      nr: {
        id: 1,
        index: 2,
        used: true,
        key: 'a',
        type: 'default',
      },
    }

    const wrapper = mount(ItemView, {
      props: {
        view,
        itemTag: 'li',
      },
      slots: {
        default: ({ item, index, active }: any) => h('span', { class: 'slot-content' }, `${item.label}|${index}|${active}`),
      },
    })

    expect(wrapper.element.tagName).toBe('LI')
    expect(wrapper.find('.slot-content').text()).toBe('Alpha|2|true')
  })

  it('uses nr.used for the active slot prop', () => {
    const wrapper = mount(ItemView, {
      props: {
        view: {
          item: { label: 'Beta' },
          position: 0,
          offset: 0,
          nr: {
            id: 2,
            index: 0,
            used: false,
            key: 'b',
            type: 'default',
          },
        },
        itemTag: 'div',
      },
      slots: {
        default: ({ active }: any) => h('span', { class: 'active-flag' }, String(active)),
      },
    })

    expect(wrapper.find('.active-flag').text()).toBe('false')
  })
})

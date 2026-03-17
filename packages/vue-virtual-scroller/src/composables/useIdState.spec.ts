import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, nextTick } from 'vue'
import { useIdState } from './useIdState'

describe('useIdState', () => {
  it('throws when called outside setup', () => {
    expect(() => useIdState()).toThrow('[useIdState] Must be called inside setup()')
  })

  it('keeps independent state per item id', async () => {
    const Harness = defineComponent({
      props: {
        item: {
          type: Object as () => { id: number, label: string },
          required: true,
        },
      },
      idState() {
        return {
          count: 0,
          label: (this as any).item.label,
        }
      },
      setup() {
        const { idState } = useIdState()
        return { idState }
      },
      template: '<div />',
    })

    const wrapper = mount(Harness, {
      props: {
        item: { id: 1, label: 'first' },
      },
    })
    const vm = wrapper.vm as any

    vm.idState.count = 3

    await wrapper.setProps({ item: { id: 2, label: 'second' } })
    await nextTick()

    expect(vm.idState.count).toBe(0)
    expect(vm.idState.label).toBe('second')

    vm.idState.count = 8
    await wrapper.setProps({ item: { id: 1, label: 'first-updated' } })
    await nextTick()

    expect(vm.idState.count).toBe(3)
    expect(vm.idState.label).toBe('first')
  })

  it('supports string idProp values', async () => {
    const Harness = defineComponent({
      props: {
        rowId: {
          type: Number,
          required: true,
        },
      },
      idState() {
        return {
          hits: 1,
        }
      },
      setup() {
        const { idState } = useIdState({ idProp: 'rowId' })
        return { idState }
      },
      template: '<div />',
    })

    const wrapper = mount(Harness, {
      props: {
        rowId: 10,
      },
    })
    const vm = wrapper.vm as any

    vm.idState.hits = 4

    await wrapper.setProps({ rowId: 11 })
    await nextTick()

    expect(vm.idState.hits).toBe(1)

    await wrapper.setProps({ rowId: 10 })
    await nextTick()

    expect(vm.idState.hits).toBe(4)
  })

  it('throws when idState option is missing', () => {
    const MissingFactory = defineComponent({
      props: {
        item: {
          type: Object as () => { id: number },
          required: true,
        },
      },
      setup() {
        useIdState()
        return {}
      },
      template: '<div />',
    })

    expect(() => mount(MissingFactory, {
      props: {
        item: { id: 1 },
      },
    })).toThrow('[useIdState] Missing `idState` function on component definition.')
  })
})

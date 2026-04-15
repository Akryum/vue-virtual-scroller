import { beforeEach, describe, expect, it, vi } from 'vitest'
import { computed, createSSRApp, defineComponent, h, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { useDynamicScrollerItem } from './useDynamicScrollerItem'

const mocks = vi.hoisted(() => {
  return {
    createDynamicScrollerItemController: vi.fn(),
  }
})

vi.mock('./dynamicScrollerMeasurement', async () => {
  const actual = await vi.importActual<typeof import('./dynamicScrollerMeasurement')>('./dynamicScrollerMeasurement')
  return {
    ...actual,
    createDynamicScrollerItemController: mocks.createDynamicScrollerItemController,
  }
})

describe('useDynamicScrollerItem', () => {
  beforeEach(() => {
    mocks.createDynamicScrollerItemController.mockReset()
    mocks.createDynamicScrollerItemController.mockReturnValue({
      id: computed(() => 'row-1'),
      size: computed(() => 0),
      finalActive: computed(() => true),
      updateSize: vi.fn(),
      mount: vi.fn(),
      unmount: vi.fn(),
    })
  })

  async function renderHarness(render: () => void) {
    const app = createSSRApp(defineComponent({
      setup() {
        render()
        return () => h('div')
      },
    }))
    app.provide('vscrollMeasurementContext', {
      vscrollData: {
        active: true,
        sizes: {},
        keyField: 'id',
        simpleArray: false,
      },
      resizeObserver: undefined,
      direction: computed(() => 'vertical'),
      undefinedMap: {},
      undefinedSizeCount: { value: 0 },
      onVscrollUpdate: () => () => {},
    })
    app.provide('vscrollAnchorRegistry', null)

    await renderToString(app)
  }

  it('supports single-object options with nested el and resize callback', async () => {
    const el = ref({} as HTMLElement)
    const onResize = vi.fn()

    await renderHarness(() => {
      useDynamicScrollerItem({
        item: { id: 'row-1' },
        active: true,
        watchData: false,
        emitResize: true,
        el,
        onResize,
      })
    })

    const [optionsArg, elArg, _contextArg, callbacksArg] = mocks.createDynamicScrollerItemController.mock.calls[0]

    expect(optionsArg.item).toEqual({ id: 'row-1' })
    expect(optionsArg.emitResize).toBe(true)
    expect(elArg.value).toBe(el.value)

    callbacksArg.onResize('row-1')
    expect(onResize).toHaveBeenCalledWith('row-1')
  })

  it('keeps legacy positional el and callbacks working', async () => {
    const el = ref({} as HTMLElement)
    const onResize = vi.fn()

    await renderHarness(() => {
      useDynamicScrollerItem({
        item: { id: 'row-1' },
        active: true,
        watchData: false,
        emitResize: false,
      }, el, {
        onResize,
      })
    })

    const [_optionsArg, elArg, _contextArg, callbacksArg] = mocks.createDynamicScrollerItemController.mock.calls[0]

    expect(elArg.value).toBe(el.value)

    callbacksArg.onResize('row-1')
    expect(onResize).toHaveBeenCalledWith('row-1')
  })
})

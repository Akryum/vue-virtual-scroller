import type { ComputedRef } from 'vue'
import type { DynamicScrollerMeasurementContext, DynamicScrollerUpdatePayload } from './dynamicScrollerMeasurement'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { computed, nextTick, reactive, ref } from 'vue'
import { createDynamicScrollerItemController } from './dynamicScrollerMeasurement'

type TestElement = HTMLElement & {
  offsetWidth: number
  offsetHeight: number
}

function createElement(width = 80, height = 40): TestElement {
  const el = document.createElement('div')
  Object.defineProperty(el, 'offsetWidth', {
    configurable: true,
    get: () => width,
    set: (value) => {
      width = value as number
    },
  })
  Object.defineProperty(el, 'offsetHeight', {
    configurable: true,
    get: () => height,
    set: (value) => {
      height = value as number
    },
  })
  return el as TestElement
}

function createContext(overrides: Partial<DynamicScrollerMeasurementContext> = {}) {
  const listeners = new Set<(payload: DynamicScrollerUpdatePayload) => void>()
  const context: DynamicScrollerMeasurementContext = {
    vscrollData: {
      active: true,
      keyField: 'id',
      simpleArray: false,
      sizes: {},
    },
    resizeObserver: undefined,
    direction: computed(() => 'vertical') as ComputedRef<'vertical'>,
    undefinedMap: {},
    undefinedSizeCount: { value: 0 },
    onVscrollUpdate(callback) {
      listeners.add(callback)
      return () => {
        listeners.delete(callback)
      }
    },
    ...overrides,
  }

  return {
    context,
    emit(payload: DynamicScrollerUpdatePayload) {
      for (const listener of listeners) {
        listener(payload)
      }
    },
    listenerCount: () => listeners.size,
  }
}

describe('dynamicScrollerMeasurement', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('resolves ids from keyed items and simple-array mode', () => {
    const keyed = createContext()
    const keyedController = createDynamicScrollerItemController({
      item: { id: 'alpha' },
      watchData: false,
      active: true,
      emitResize: false,
    }, ref(createElement()), keyed.context)

    expect(keyedController.id.value).toBe('alpha')

    const simple = createContext({
      vscrollData: {
        active: true,
        keyField: 'id',
        simpleArray: true,
        sizes: {},
      },
    })
    const simpleController = createDynamicScrollerItemController({
      item: 'row',
      watchData: false,
      active: true,
      index: 7,
      emitResize: false,
    }, ref(createElement()), simple.context)

    expect(simpleController.id.value).toBe(7)
    expect(() => createDynamicScrollerItemController({
      item: 'row',
      watchData: false,
      active: true,
      emitResize: false,
    }, ref(createElement()), simple.context).id.value).toThrow('index is required')
  })

  it('tracks undefined sizes as items become active and inactive', async () => {
    const options = reactive({
      item: { id: 'alpha' },
      watchData: false,
      active: false,
      emitResize: false,
      sizeDependencies: ['a'],
    })
    const { context } = createContext()
    const controller = createDynamicScrollerItemController(options, ref(createElement()), context)

    options.active = true
    await nextTick()
    expect(context.undefinedMap.alpha).toBe(true)
    expect(context.undefinedSizeCount.value).toBe(1)

    options.active = false
    await nextTick()
    expect(context.undefinedMap.alpha).toBe(false)
    expect(context.undefinedSizeCount.value).toBe(0)

    controller.unmount()
  })

  it('applies resize-observer measurements and cleans up on unmount', async () => {
    const observe = vi.fn()
    const unobserve = vi.fn()
    const element = createElement(120, 60)
    const options = reactive({
      item: { id: 'alpha' },
      watchData: false,
      active: true,
      emitResize: true,
      sizeDependencies: ['a'],
    })
    const callbacks = {
      onResize: vi.fn(),
    }
    const { context, listenerCount } = createContext({
      resizeObserver: {
        observe,
        unobserve,
      } as unknown as ResizeObserver,
    })
    const controller = createDynamicScrollerItemController(options, ref(element), context, callbacks)

    controller.mount()
    await nextTick()

    expect(observe).toHaveBeenCalledWith(element)
    expect((element as any).$_vs_id).toBe('alpha')

    ;(element as any).$_vs_onResize('alpha', 120, 72)

    expect(context.vscrollData.sizes.alpha).toBe(72)
    expect(callbacks.onResize).toHaveBeenCalledWith('alpha')
    expect(listenerCount()).toBe(0)

    controller.unmount()

    expect(unobserve).toHaveBeenCalledWith(element)
    expect((element as any).$_vs_id).toBeUndefined()
    expect((element as any).$_vs_onResize).toBeUndefined()
  })

  it('remeasures on dependency changes and unsubscribes from vscroll updates', async () => {
    const element = createElement(80, 32)
    const options = reactive({
      item: { id: 'alpha', label: 'A' },
      watchData: true,
      active: true,
      emitResize: false,
      sizeDependencies: ['a'],
    })
    const { context, emit, listenerCount } = createContext()
    const controller = createDynamicScrollerItemController(options, ref(element), context)

    controller.mount()
    await nextTick()
    await nextTick()
    expect(context.vscrollData.sizes.alpha).toBe(32)
    expect(listenerCount()).toBe(1)

    element.offsetHeight = 48
    options.sizeDependencies = ['b']
    await nextTick()
    await nextTick()
    expect(context.vscrollData.sizes.alpha).toBe(48)

    element.offsetHeight = 64
    emit({ force: true })
    await nextTick()
    await nextTick()
    expect(context.vscrollData.sizes.alpha).toBe(64)

    controller.unmount()
    expect(listenerCount()).toBe(0)

    element.offsetHeight = 96
    options.sizeDependencies = ['c']
    options.item = { id: 'alpha', label: 'B' }
    await nextTick()
    await nextTick()
    expect(context.vscrollData.sizes.alpha).toBe(64)
  })
})

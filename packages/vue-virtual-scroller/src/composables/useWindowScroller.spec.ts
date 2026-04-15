import type { UseWindowScrollerOptions } from './useWindowScroller'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { useWindowScroller } from './useWindowScroller'

const mocks = vi.hoisted(() => {
  return {
    useRecycleScroller: vi.fn(),
  }
})

vi.mock('./useRecycleScroller', () => {
  return {
    useRecycleScroller: mocks.useRecycleScroller,
  }
})

describe('useWindowScroller', () => {
  beforeEach(() => {
    mocks.useRecycleScroller.mockReset()
  })

  it('forces page mode and forwards remaining inputs unchanged', () => {
    const expected = {
      getViewStyle: vi.fn(),
      pool: [],
      totalSize: 10,
    }
    const options: UseWindowScrollerOptions = {
      items: [{ id: 1 }],
      keyField: 'id',
      direction: 'vertical',
      itemSize: 20,
      minItemSize: null,
      sizeField: 'size',
      typeField: 'type',
      buffer: 0,
      pageMode: false,
      shift: true,
      disableTransform: true,
      prerender: 0,
      emitUpdate: false,
      updateInterval: 0,
    }
    const el = ref({} as HTMLElement)
    const before = ref({} as HTMLElement)
    const after = ref({} as HTMLElement)
    const callbacks = {
      onResize: vi.fn(),
    }
    mocks.useRecycleScroller.mockReturnValue(expected)

    const result = useWindowScroller(options, el, before, after, callbacks)

    expect(result).toBe(expected)
    expect(mocks.useRecycleScroller).toHaveBeenCalledTimes(1)

    const [forwardedOptions, forwardedEl, forwardedBefore, forwardedAfter, forwardedCallbacks, forwardedOverrides] = mocks.useRecycleScroller.mock.calls[0]
    expect(forwardedOptions).toBe(options)
    expect(forwardedEl).toBe(el)
    expect(forwardedBefore).toBe(before)
    expect(forwardedAfter).toBe(after)
    expect(forwardedCallbacks).toBe(callbacks)
    expect(forwardedOverrides).toEqual({
      pageMode: true,
    })
    expect(result.getViewStyle).toBe(expected.getViewStyle)
  })

  it('supports single-object options and still forces page mode', () => {
    const options: UseWindowScrollerOptions = {
      items: [{ id: 1 }],
      keyField: 'id',
      itemSize: 20,
      minItemSize: null,
      sizeField: 'size',
      typeField: 'type',
      buffer: 0,
      shift: false,
      disableTransform: false,
      prerender: 0,
      emitUpdate: false,
      updateInterval: 0,
      el: ref({} as HTMLElement),
      onVisible: vi.fn(),
    }
    mocks.useRecycleScroller.mockReturnValue({})

    useWindowScroller(options)

    const [forwardedOptions, forwardedEl, forwardedBefore, forwardedAfter, forwardedCallbacks, forwardedOverrides] = mocks.useRecycleScroller.mock.calls[0]
    expect(forwardedOptions).toBe(options)
    expect(forwardedEl).toBeUndefined()
    expect(forwardedBefore).toBeUndefined()
    expect(forwardedAfter).toBeUndefined()
    expect(forwardedCallbacks).toBeUndefined()
    expect(forwardedOverrides).toEqual({
      pageMode: true,
    })
    expect(forwardedOptions.direction).toBeUndefined()
  })
})

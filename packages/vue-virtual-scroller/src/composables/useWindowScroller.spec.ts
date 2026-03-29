import type { UseWindowScrollerOptions } from './useWindowScroller'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref, toValue } from 'vue'
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

  it('forces page mode and forwards the remaining inputs unchanged', () => {
    const expected = {
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
      prerender: 0,
      emitUpdate: false,
      updateInterval: 0,
    }
    const el = ref(document.createElement('div'))
    const before = ref(document.createElement('div'))
    const after = ref(document.createElement('div'))
    const callbacks = {
      onResize: vi.fn(),
    }
    mocks.useRecycleScroller.mockReturnValue(expected)

    const result = useWindowScroller(options, el, before, after, callbacks)

    expect(result).toBe(expected)
    expect(mocks.useRecycleScroller).toHaveBeenCalledTimes(1)

    const [forwardedOptions, forwardedEl, forwardedBefore, forwardedAfter, forwardedCallbacks] = mocks.useRecycleScroller.mock.calls[0]
    expect(toValue(forwardedOptions)).toEqual({
      ...options,
      pageMode: true,
    })
    expect(forwardedEl).toBe(el)
    expect(forwardedBefore).toBe(before)
    expect(forwardedAfter).toBe(after)
    expect(forwardedCallbacks).toBe(callbacks)
  })
})

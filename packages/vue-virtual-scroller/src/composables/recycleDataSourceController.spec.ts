import type { DataSource } from '../types'
import type { RecycleDataSourceOptions } from './recycleDataSourceController'
import { describe, expect, it, vi } from 'vitest'
import { createRecycleDataSourceController } from './recycleDataSourceController'

function createController<TItem>(options: RecycleDataSourceOptions<TItem>) {
  const updateVisibleItems = vi.fn()
  const controller = createRecycleDataSourceController(() => options, updateVisibleItems)
  return {
    controller,
    updateVisibleItems,
  }
}

function rangeItems(startIndex: number, endIndex: number) {
  return Array.from({ length: endIndex - startIndex }, (_, offset) => ({ id: startIndex + offset }))
}

describe('createRecycleDataSourceController', () => {
  it('returns item slices when no dataSource is configured', () => {
    const { controller } = createController({
      items: [{ id: 0 }, { id: 1 }, { id: 2 }],
    })

    expect(controller.getVisibleItems(1, 3)).toEqual([{ id: 1 }, { id: 2 }])
  })

  it('loads synchronous ranges and marks indexes as loaded', () => {
    const getItems = vi.fn((startIndex: number, endIndex: number, signal?: AbortSignal) => {
      expect(signal).toBeInstanceOf(AbortSignal)
      return rangeItems(startIndex, endIndex)
    })
    const { controller, updateVisibleItems } = createController({
      dataSource: {
        getItems,
        getItemKey: (index: number) => index,
      },
      count: 100,
    })

    expect(controller.getVisibleItems(0, 3)).toEqual([{ id: 0 }, { id: 1 }, { id: 2 }])
    expect(controller.hasItem(1)).toBe(true)
    expect(controller.hasItem(4)).toBe(false)
    expect(updateVisibleItems).not.toHaveBeenCalled()
  })

  it('loads asynchronous ranges and updates visible items after resolve', async () => {
    let resolveRange: (items: unknown[]) => void = () => {}
    const { controller, updateVisibleItems } = createController({
      dataSource: {
        getItems: () => new Promise<unknown[]>((resolve) => {
          resolveRange = resolve
        }),
        getItemKey: (index: number) => index,
      },
      count: 100,
    })

    expect(controller.getVisibleItems(0, 2)).toEqual([undefined, undefined])
    expect(controller.hasItem(0)).toBe(false)

    resolveRange([{ id: 0 }, { id: 1 }])
    await Promise.resolve()

    expect(updateVisibleItems).toHaveBeenCalledWith(true)
    expect(controller.getVisibleItems(0, 2)).toEqual([{ id: 0 }, { id: 1 }])
  })

  it('dedupes overlapping pending ranges by index', () => {
    const getItems = vi.fn(() => new Promise<unknown[]>(() => {}))
    const { controller } = createController({
      dataSource: {
        getItems,
        getItemKey: (index: number) => index,
      },
      count: 100,
    })

    controller.getVisibleItems(0, 10)
    controller.getVisibleItems(5, 15)

    expect(getItems.mock.calls.map(call => call.slice(0, 2))).toEqual([
      [0, 10],
      [10, 15],
    ])
  })

  it('aborts requests whose whole range leaves the rendered window', () => {
    const signals: AbortSignal[] = []
    const getItems = vi.fn((_startIndex: number, _endIndex: number, signal?: AbortSignal) => {
      signals.push(signal!)
      return new Promise<unknown[]>(() => {})
    })
    const { controller } = createController({
      dataSource: {
        getItems,
        getItemKey: (index: number) => index,
      },
      count: 100,
    })

    controller.getVisibleItems(0, 10)
    controller.getVisibleItems(50, 60)

    expect(signals[0].aborted).toBe(true)
    expect(signals[1].aborted).toBe(false)
  })

  it('keeps partially overlapping requests pending', () => {
    const signals: AbortSignal[] = []
    const getItems = vi.fn((_startIndex: number, _endIndex: number, signal?: AbortSignal) => {
      signals.push(signal!)
      return new Promise<unknown[]>(() => {})
    })
    const { controller } = createController({
      dataSource: {
        getItems,
        getItemKey: (index: number) => index,
      },
      count: 100,
    })

    controller.getVisibleItems(0, 10)
    controller.getVisibleItems(5, 15)

    expect(signals[0].aborted).toBe(false)
    expect(signals[1].aborted).toBe(false)
  })

  it('suppresses aborted request errors', async () => {
    const onDataSourceError = vi.fn()
    let rejectRange: (error: unknown) => void = () => {}
    const { controller } = createController({
      dataSource: {
        getItems: () => new Promise<unknown[]>((_resolve, reject) => {
          rejectRange = reject
        }),
        getItemKey: (index: number) => index,
      },
      count: 100,
      onDataSourceError,
    })

    controller.getVisibleItems(0, 10)
    controller.abortAllRequests()
    rejectRange(new DOMException('aborted', 'AbortError'))
    await Promise.resolve()

    expect(onDataSourceError).not.toHaveBeenCalled()
  })

  it('reports synchronous and asynchronous load errors', async () => {
    const syncError = new Error('sync')
    const asyncError = new Error('async')
    const onDataSourceError = vi.fn()
    const dataSource: DataSource<unknown> = {
      getItems: vi.fn(() => {
        throw syncError
      }),
      getItemKey: (index: number) => index,
    }
    const { controller } = createController({
      dataSource,
      count: 100,
      onDataSourceError,
    })

    controller.getVisibleItems(0, 2)
    expect(onDataSourceError).toHaveBeenCalledWith(syncError, 0, 2)

    dataSource.getItems = vi.fn(() => Promise.reject(asyncError))
    controller.getVisibleItems(0, 2)
    await Promise.resolve()

    expect(onDataSourceError).toHaveBeenCalledWith(asyncError, 0, 2)
  })

  it('ignores stale results after clearCache', async () => {
    let resolveFirst: (items: unknown[]) => void = () => {}
    const getItems = vi.fn(() => new Promise<unknown[]>((resolve) => {
      resolveFirst = resolve
    }))
    const { controller, updateVisibleItems } = createController({
      dataSource: {
        getItems,
        getItemKey: (index: number) => index,
      },
      count: 100,
    })

    controller.getVisibleItems(0, 2)
    controller.clearCache()
    resolveFirst([{ id: 0 }, { id: 1 }])
    await Promise.resolve()

    expect(updateVisibleItems).not.toHaveBeenCalled()
    expect(controller.hasItem(0)).toBe(false)
  })

  it('ignores stale results after the dataSource identity changes', async () => {
    let resolveFirst: (items: unknown[]) => void = () => {}
    const firstDataSource = {
      getItems: () => new Promise<unknown[]>((resolve) => {
        resolveFirst = resolve
      }),
      getItemKey: (index: number) => index,
    }
    const options: RecycleDataSourceOptions<unknown> = {
      dataSource: firstDataSource,
      count: 100,
    }
    const { controller, updateVisibleItems } = createController(options)

    controller.getVisibleItems(0, 2)
    options.dataSource = {
      getItems: (startIndex: number, endIndex: number) => rangeItems(startIndex, endIndex),
      getItemKey: (index: number) => index,
    }
    resolveFirst([{ id: 0 }, { id: 1 }])
    await Promise.resolve()

    expect(updateVisibleItems).not.toHaveBeenCalled()
    expect(controller.getVisibleItems(0, 2)).toEqual([{ id: 0 }, { id: 1 }])
  })

  it('evicts least-recently used rows outside the protected range', () => {
    const getItems = vi.fn((startIndex: number, endIndex: number) => rangeItems(startIndex, endIndex))
    const { controller } = createController({
      dataSource: {
        getItems,
        getItemKey: (index: number) => index,
      },
      count: 100,
      dataSourceCacheSize: 2,
    })

    controller.getVisibleItems(0, 2)
    controller.getVisibleItems(2, 4)
    controller.getVisibleItems(0, 2)

    expect(getItems.mock.calls.map(call => call.slice(0, 2))).toEqual([
      [0, 2],
      [2, 4],
      [0, 2],
    ])
  })

  it('keeps protected rows even when the rendered range exceeds cache size', () => {
    const getItems = vi.fn((startIndex: number, endIndex: number) => rangeItems(startIndex, endIndex))
    const { controller } = createController({
      dataSource: {
        getItems,
        getItemKey: (index: number) => index,
      },
      count: 100,
      dataSourceCacheSize: 1,
    })

    controller.getVisibleItems(0, 3)

    expect(controller.hasItem(0)).toBe(true)
    expect(controller.hasItem(1)).toBe(true)
    expect(controller.hasItem(2)).toBe(true)
  })
})

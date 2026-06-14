import type { MaybeRefOrGetter } from 'vue'
import type { DataSource } from '../types'
import type { DataSourceOptions } from '../utils/datasource'
import { toValue } from 'vue'
import { getDataSource, getDataSourceItems } from '../utils/datasource'

export interface RecycleDataSourceOptions<TItem = unknown> extends DataSourceOptions<TItem> {
  dataSourceCacheSize?: MaybeRefOrGetter<number | null | undefined>
  onDataSourceError?: (error: unknown, startIndex: number, endIndex: number) => void
}

export interface RecycleDataSourceController<TItem = unknown> {
  clearCache: () => void
  abortAllRequests: () => void
  getVisibleItems: (startIndex: number, endIndex: number) => Array<TItem | undefined>
  hasItem: (index: number) => boolean
}

export function createRecycleDataSourceController<TItem>(
  getOptions: () => RecycleDataSourceOptions<TItem>,
  updateVisibleItems: (itemsChanged: boolean) => void,
): RecycleDataSourceController<TItem> {
  const items = new Map<number, TItem>()
  const pendingIndexes = new Set<number>()
  const requests = new Map<number, { startIndex: number, endIndex: number, controller: AbortController }>()
  let version = 0
  let requestId = 0

  function isPromiseLike<T>(value: T[] | Promise<T[]>): value is Promise<T[]> {
    return typeof (value as Promise<T[]>).then === 'function'
  }

  function getCacheSize(): number {
    const cacheSize = toValue(getOptions().dataSourceCacheSize)
    return typeof cacheSize === 'number' && Number.isFinite(cacheSize)
      ? Math.max(0, Math.floor(cacheSize))
      : 1000
  }

  function touchItem(index: number) {
    if (!items.has(index)) {
      return
    }
    const item = items.get(index)!
    items.delete(index)
    items.set(index, item)
  }

  function setItem(index: number, item: TItem) {
    if (items.has(index)) {
      items.delete(index)
    }
    items.set(index, item)
  }

  function makeProtectedIndexSet(startIndex: number, endIndex: number): Set<number> {
    const protectedIndexes = new Set<number>()
    for (let index = startIndex; index < endIndex; index++) {
      protectedIndexes.add(index)
    }
    return protectedIndexes
  }

  function evictCache(protectedIndexes: Set<number>) {
    const maxSize = getCacheSize()
    if (items.size <= maxSize) {
      return
    }

    for (const index of items.keys()) {
      if (protectedIndexes.has(index)) {
        continue
      }
      items.delete(index)
      if (items.size <= maxSize) {
        break
      }
    }
  }

  function finishRequestRange(startIndex: number, endIndex: number) {
    for (let index = startIndex; index < endIndex; index++) {
      pendingIndexes.delete(index)
    }
  }

  function finishTrackedRequest(id: number) {
    const request = requests.get(id)
    if (!request) {
      return
    }
    requests.delete(id)
    finishRequestRange(request.startIndex, request.endIndex)
  }

  function abortTrackedRequest(id: number) {
    const request = requests.get(id)
    if (!request) {
      return
    }
    finishTrackedRequest(id)
    request.controller.abort()
  }

  function abortRequestsOutsideRange(startIndex: number, endIndex: number) {
    for (const [id, request] of requests) {
      if (request.startIndex < endIndex && request.endIndex > startIndex) {
        continue
      }
      abortTrackedRequest(id)
    }
  }

  function abortAllRequests() {
    for (const id of [...requests.keys()]) {
      abortTrackedRequest(id)
    }
  }

  function clearCache() {
    version++
    abortAllRequests()
    items.clear()
    pendingIndexes.clear()
  }

  function requestRange(dataSource: DataSource<TItem>, startIndex: number, endIndex: number, requestVersion: number) {
    const id = requestId++
    const controller = new AbortController()
    requests.set(id, { startIndex, endIndex, controller })
    for (let index = startIndex; index < endIndex; index++) {
      pendingIndexes.add(index)
    }

    const applyItems = (loadedItems: TItem[], shouldUpdate: boolean) => {
      finishTrackedRequest(id)
      if (controller.signal.aborted) {
        return
      }
      if (requestVersion !== version || getDataSource(getOptions()) !== dataSource) {
        return
      }
      for (let offset = 0; offset < loadedItems.length; offset++) {
        setItem(startIndex + offset, loadedItems[offset])
      }
      evictCache(makeProtectedIndexSet(startIndex, endIndex))
      if (shouldUpdate) {
        updateVisibleItems(true)
      }
    }

    const handleError = (error: unknown) => {
      finishTrackedRequest(id)
      if (controller.signal.aborted) {
        return
      }
      if (requestVersion === version && getDataSource(getOptions()) === dataSource) {
        getOptions().onDataSourceError?.(error, startIndex, endIndex)
      }
    }

    try {
      const result = dataSource.getItems(startIndex, endIndex, controller.signal)
      if (isPromiseLike(result)) {
        result.then(items => applyItems(items, true), handleError)
      }
      else {
        applyItems(result, false)
      }
    }
    catch (error) {
      handleError(error)
    }
  }

  function getVisibleItems(startIndex: number, endIndex: number): Array<TItem | undefined> {
    const opts = getOptions()
    const dataSource = getDataSource(opts)
    if (!dataSource) {
      return getDataSourceItems(opts, startIndex, endIndex) as TItem[]
    }

    abortRequestsOutsideRange(startIndex, endIndex)

    const missingRanges: Array<{ startIndex: number, endIndex: number }> = []
    let missingStart: number | null = null
    for (let index = startIndex; index < endIndex; index++) {
      if (items.has(index)) {
        touchItem(index)
        if (missingStart != null) {
          missingRanges.push({ startIndex: missingStart, endIndex: index })
          missingStart = null
        }
        continue
      }

      if (pendingIndexes.has(index)) {
        if (missingStart != null) {
          missingRanges.push({ startIndex: missingStart, endIndex: index })
          missingStart = null
        }
        continue
      }

      missingStart ??= index
    }
    if (missingStart != null) {
      missingRanges.push({ startIndex: missingStart, endIndex })
    }

    if (missingRanges.length > 0) {
      const requestVersion = version
      for (const range of missingRanges) {
        requestRange(dataSource, range.startIndex, range.endIndex, requestVersion)
      }
    }
    evictCache(makeProtectedIndexSet(startIndex, endIndex))

    const visibleItems: Array<TItem | undefined> = []
    for (let index = startIndex; index < endIndex; index++) {
      visibleItems.push(items.get(index))
    }
    return visibleItems
  }

  function hasItem(index: number): boolean {
    return items.has(index)
  }

  return {
    clearCache,
    abortAllRequests,
    getVisibleItems,
    hasItem,
  }
}

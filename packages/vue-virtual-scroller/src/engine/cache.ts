import type { CacheSnapshot, ScrollAlign } from '../types'

export function getItemKey(item: unknown, index: number, keyField: string | null): string | number {
  if (!keyField) {
    return index
  }

  const key = (item as any)?.[keyField]
  if (key == null) {
    throw new Error(`Key is ${key} on item (keyField is '${keyField}')`)
  }
  return key
}

export function getItemKeys(items: unknown[], keyField: string | null): Array<string | number> {
  return items.map((item, index) => getItemKey(item, index, keyField))
}

export function buildCacheSnapshot(
  items: unknown[],
  keyField: string | null,
  getSize: (item: unknown, index: number, key: string | number) => number | undefined,
): CacheSnapshot {
  const keys: Array<string | number> = []
  const sizes: Array<number | null> = []

  for (let index = 0; index < items.length; index++) {
    const item = items[index]
    const key = getItemKey(item, index, keyField)
    const size = getSize(item, index, key)
    keys.push(key)
    sizes.push(typeof size === 'number' && size > 0 ? size : null)
  }

  return {
    keys,
    sizes,
  }
}

export function isCacheSnapshotCompatible(
  snapshot: CacheSnapshot | null | undefined,
  items: unknown[],
  keyField: string | null,
): snapshot is CacheSnapshot {
  if (!snapshot) {
    return false
  }

  if (snapshot.keys.length !== items.length || snapshot.sizes.length !== items.length) {
    return false
  }

  for (let index = 0; index < items.length; index++) {
    if (snapshot.keys[index] !== getItemKey(items[index], index, keyField)) {
      return false
    }
  }

  return true
}

export function restoreCacheMap(
  snapshot: CacheSnapshot | null | undefined,
  items: unknown[],
  keyField: string | null,
): Record<string | number, number> {
  if (!isCacheSnapshotCompatible(snapshot, items, keyField)) {
    return {}
  }

  const result: Record<string | number, number> = {}
  for (let index = 0; index < snapshot.keys.length; index++) {
    const size = snapshot.sizes[index]
    if (typeof size === 'number' && size > 0) {
      result[snapshot.keys[index]] = size
    }
  }
  return result
}

export function findPrependOffset(
  previousKeys: Array<string | number>,
  nextKeys: Array<string | number>,
): number {
  if (!previousKeys.length || nextKeys.length <= previousKeys.length) {
    return 0
  }

  const firstKey = previousKeys[0]
  const startIndex = nextKeys.indexOf(firstKey)
  if (startIndex <= 0) {
    return 0
  }

  if (startIndex + previousKeys.length < nextKeys.length && previousKeys.length > nextKeys.length - startIndex) {
    return 0
  }

  for (let index = 0; index < previousKeys.length; index++) {
    if (nextKeys[startIndex + index] !== previousKeys[index]) {
      return 0
    }
  }

  return startIndex
}

export function getAlignedScrollOffset(
  itemStart: number,
  itemSize: number,
  viewportStart: number,
  viewportSize: number,
  align: ScrollAlign | undefined,
  offset = 0,
): number | null {
  const safeAlign = align ?? 'start'

  if (safeAlign === 'nearest') {
    const viewportEnd = viewportStart + viewportSize
    const itemEnd = itemStart + itemSize
    if (itemStart >= viewportStart && itemEnd <= viewportEnd) {
      return null
    }

    if (itemStart < viewportStart) {
      return itemStart + offset
    }

    return itemEnd - viewportSize + offset
  }

  if (safeAlign === 'end') {
    return itemStart + itemSize - viewportSize + offset
  }

  if (safeAlign === 'center') {
    return itemStart + ((itemSize - viewportSize) / 2) + offset
  }

  return itemStart + offset
}

import type { ItemSizeValue } from '../types'

/**
 * Return numeric fixed item size when scroller runs in fixed-size mode.
 */
export function getFixedItemSize<TItem>(itemSize: ItemSizeValue<TItem>): number | null {
  return typeof itemSize === 'number' ? itemSize : null
}

/**
 * Resolve serializable size value for cache snapshots.
 */
export function resolveSnapshotItemSize<TItem>(
  item: TItem,
  index: number,
  itemSize: ItemSizeValue<TItem>,
  restoredSize: number | undefined,
  sizeField?: string,
): number | undefined {
  if (typeof itemSize === 'number') {
    return itemSize
  }

  if (typeof itemSize === 'function') {
    return itemSize(item, index) || restoredSize || undefined
  }

  return restoredSize || (item as any)?.[sizeField ?? 'size'] || undefined
}

/**
 * Resolve runtime size for variable-size mode, with safety fallback.
 */
export function resolveVariableItemSize<TItem>(
  item: TItem,
  index: number,
  itemSize: ItemSizeValue<TItem>,
  restoredSize: number | undefined,
  minItemSize: number | string | null | undefined,
  sizeField?: string,
): number {
  if (typeof itemSize === 'function') {
    return itemSize(item, index) || restoredSize || Number(minItemSize) || 0
  }

  return restoredSize || (item as any)?.[sizeField ?? 'size'] || Number(minItemSize) || 0
}

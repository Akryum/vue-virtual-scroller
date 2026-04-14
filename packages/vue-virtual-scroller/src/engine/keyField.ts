import type { KeyFieldValue, KeyValue } from '../types'

/**
 * Formats a keyField value for human-readable error messages.
 */
export function formatKeyField(keyField: KeyFieldValue<any> | null): string {
  if (keyField == null) {
    return 'null'
  }

  if (typeof keyField === 'function') {
    return 'a function'
  }

  return `'${keyField}'`
}

/**
 * Resolves the stable key for a list item from either a property name or a callback.
 */
export function resolveItemKey<TItem>(
  item: TItem,
  index: number,
  keyField: KeyFieldValue<TItem> | null,
): KeyValue {
  if (!keyField) {
    return index
  }

  const key = typeof keyField === 'function'
    ? keyField(item, index)
    : (item as any)?.[keyField]

  if (key == null) {
    throw new Error(`Key is ${key} on item (keyField is ${formatKeyField(keyField)})`)
  }

  return key
}

/**
 * Resolves an object-item key when an index is available or can be ignored by the resolver.
 */
export function resolveItemKeyWithOptionalIndex<TItem>(
  item: TItem,
  index: number | undefined,
  keyField: KeyFieldValue<TItem>,
): KeyValue {
  if (typeof keyField === 'function' && index == null) {
    throw new Error('index is required when using a function keyField')
  }

  return resolveItemKey(item, index ?? 0, keyField)
}

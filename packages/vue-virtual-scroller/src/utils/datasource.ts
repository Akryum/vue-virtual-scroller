import type { MaybeRefOrGetter } from 'vue'
import type { DataSource, KeyValue } from '../types'
import { toValue } from 'vue'

export interface DataSourceOptions<TItem = unknown> {
  items?: MaybeRefOrGetter<TItem[] | null | undefined>
  dataSource?: MaybeRefOrGetter<DataSource<TItem> | null | undefined>
  count?: MaybeRefOrGetter<number | null | undefined>
}

export function getDataSource<TItem>(options: DataSourceOptions<TItem>): DataSource<TItem> | null | undefined {
  return toValue(options.dataSource)
}

export function validateDataSourceOptions<TItem>(options: DataSourceOptions<TItem>) {
  const items = toValue(options.items)
  const resolvedDataSource = getDataSource(options)
  const count = toValue(options.count)

  if (items && resolvedDataSource) {
    throw new Error('Cannot use both items and dataSource at the same time')
  }
  if (resolvedDataSource && count == null) {
    throw new Error('count is required when using dataSource')
  }
  if (resolvedDataSource && typeof resolvedDataSource.getItems !== 'function') {
    throw new TypeError('DataSource must implement getItems(startIndex, endIndex, signal?) method')
  }
  if (resolvedDataSource && typeof resolvedDataSource.getItemKey !== 'function') {
    throw new TypeError('DataSource must implement getItemKey(index) method')
  }
}

export function validateRecycleDataSourceOptions<TItem>(
  options: DataSourceOptions<TItem> & {
    itemSize?: unknown
  },
) {
  validateDataSourceOptions(options)

  const dataSource = getDataSource(options)
  if (!dataSource) {
    return
  }

  if (typeof options.itemSize !== 'number') {
    throw new TypeError('DataSource mode requires a fixed numeric itemSize')
  }
}

export function getDataSourceItemCount<TItem>(options: DataSourceOptions<TItem>): number {
  const dataSource = getDataSource(options)
  if (dataSource) {
    return toValue(options.count) ?? 0
  }
  return toValue(options.items)?.length ?? 0
}

export function getDataSourceItems<TItem>(
  options: DataSourceOptions<TItem>,
  startIndex: number,
  endIndex: number,
  signal?: AbortSignal,
): TItem[] | Promise<TItem[]> {
  const dataSource = getDataSource(options)
  if (dataSource) {
    return dataSource.getItems(startIndex, endIndex, signal)
  }
  return toValue(options.items)?.slice(startIndex, endIndex) ?? []
}

export function getDataSourceItemKey<TItem>(
  options: DataSourceOptions<TItem>,
  index: number,
  _keyField: unknown,
): KeyValue {
  const dataSource = getDataSource(options)
  if (dataSource?.getItemKey) {
    return dataSource.getItemKey(index)
  }

  return index
}

export function getDataSourceSnapshot<TItem>(
  options: DataSourceOptions<TItem>,
  purpose = 'this operation',
): TItem[] {
  const dataSource = getDataSource(options)
  if (dataSource) {
    throw new Error(`DataSource mode cannot materialize all items for ${purpose}`)
  }

  return toValue(options.items)?.slice(0, getDataSourceItemCount(options)) ?? []
}

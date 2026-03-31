import type { ComputedRef, Ref } from 'vue'

export type ScrollDirection = 'vertical' | 'horizontal'

export type ScrollAlign = 'start' | 'center' | 'end' | 'nearest'

export type KeyValue = string | number

export type StringKeyOf<T> = Extract<keyof T, string>

export type ValidKeyField<TItem, TKeyField extends string> = TItem extends object
  ? TKeyField extends StringKeyOf<TItem> ? TKeyField : never
  : string

export type NumericFieldKey<TItem> = TItem extends object
  ? Extract<{
    [K in StringKeyOf<TItem>]-?: Exclude<TItem[K], undefined> extends number ? K : never
  }[StringKeyOf<TItem>], string>
  : string

export type ValidSizeField<TItem, TSizeField extends string> = TItem extends object
  ? [NumericFieldKey<TItem>] extends [never]
      ? string
      : TSizeField extends NumericFieldKey<TItem> ? TSizeField : never
  : string

export type ItemKey<TItem, TKeyField extends string = 'id'> = TItem extends object
  ? Extract<TKeyField extends keyof TItem ? TItem[TKeyField] : never, KeyValue>
  : number

export type ClassValue = string | Record<string, boolean> | Array<string | Record<string, boolean>>

export interface ScrollToOptions {
  align?: ScrollAlign
  smooth?: boolean
  offset?: number
}

export interface ScrollState {
  start: number
  end: number
}

export interface ViewNonReactive<TKey = KeyValue> {
  id: number
  index: number
  used: boolean
  key: TKey
  type: unknown
}

export interface View<TItem = unknown, TKey = KeyValue> {
  item: TItem
  position: number
  offset: number
  nr: ViewNonReactive<TKey>
}

export interface CacheSnapshot {
  keys: KeyValue[]
  sizes: Array<number | null>
}

export interface SizeEntry {
  accumulator: number
  size?: number
}

export interface Sizes {
  [key: number]: SizeEntry
}

export interface VScrollData {
  active: boolean
  sizes: Record<KeyValue, number>
  keyField: string
  simpleArray: boolean
}

export interface ItemWithSize<TItem = unknown, TKey = KeyValue> {
  item: TItem
  id: TKey
  size: number | undefined
}

export interface RecycleScrollerSlotProps<TItem = unknown> {
  item: TItem
  index: number
  active: boolean
}

export interface DynamicScrollerSlotProps<TItem = unknown, TKey = KeyValue> extends RecycleScrollerSlotProps<TItem> {
  itemWithSize: ItemWithSize<TItem, TKey>
}

export interface RecycleScrollerExposed<TItem = unknown, TKey = KeyValue> {
  el: Ref<HTMLElement | undefined>
  visiblePool: ComputedRef<Array<View<TItem, TKey>>>
  scrollToItem: (index: number, options?: ScrollToOptions) => void
  scrollToPosition: (position: number, options?: ScrollToOptions) => void
  getScroll: () => ScrollState
  findItemIndex: (offset: number) => number
  getItemOffset: (index: number) => number
  getItemSize: (index: number) => number
  cacheSnapshot: ComputedRef<CacheSnapshot>
  restoreCache: (snapshot: CacheSnapshot | null | undefined) => boolean
  updateVisibleItems: (itemsChanged: boolean, checkPositionDiff?: boolean) => { continuous: boolean }
}

export interface DynamicScrollerExposed<TItem = unknown> {
  scrollToItem: (index: number, options?: ScrollToOptions) => void
  scrollToPosition: (position: number, options?: ScrollToOptions) => void
  findItemIndex: (offset: number) => number
  getItemOffset: (index: number) => number
  scrollToBottom: () => void
  getItemSize: (item: TItem, index?: number) => number
  cacheSnapshot: ComputedRef<CacheSnapshot>
  restoreCache: (snapshot: CacheSnapshot | null | undefined) => boolean
  forceUpdate: (clear?: boolean) => void
}

// eslint-disable-next-line unused-imports/no-unused-vars
export interface WindowScrollerExposed<TItem = unknown, TKey = KeyValue> {
  el: Ref<HTMLElement | undefined>
  scrollToItem: (index: number, options?: ScrollToOptions) => void
  scrollToPosition: (position: number, options?: ScrollToOptions) => void
  getScroll: () => ScrollState
  findItemIndex: (offset: number) => number
  getItemOffset: (index: number) => number
  getItemSize: (index: number) => number
  cacheSnapshot: ComputedRef<CacheSnapshot>
  restoreCache: (snapshot: CacheSnapshot | null | undefined) => boolean
  updateVisibleItems: (itemsChanged: boolean, checkPositionDiff?: boolean) => { continuous: boolean }
}

export interface PluginOptions {
  installComponents?: boolean
  componentsPrefix?: string
}

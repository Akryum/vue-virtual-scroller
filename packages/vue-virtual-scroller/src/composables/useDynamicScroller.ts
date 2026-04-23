import type { ComputedRef, CSSProperties, Directive, MaybeRefOrGetter, Ref } from 'vue'
import type { CacheSnapshot, DefaultKeyField, DynamicScrollerView, ItemKey, ItemWithSize, KeyFieldValue, KeyValue, ScrollDirection, ValidKeyField, View, VScrollData } from '../types'
import type { DynamicScrollerItemControllerCallbacks, DynamicScrollerItemControllerOptions, DynamicScrollerMeasurementContext, DynamicScrollerUpdatePayload } from './dynamicScrollerMeasurement'
import type { UseRecycleScrollerOptions, UseRecycleScrollerReturn } from './useRecycleScroller'
import { computed, effectScope, nextTick, onActivated, onDeactivated, onUnmounted, provide, reactive, shallowReactive, shallowRef, toValue, triggerRef, watch, watchEffect } from 'vue'
import { findPrependOffset, getItemKeys, restoreCacheMap } from '../engine/cache'
import { resolveItemKey, resolveItemKeyWithOptionalIndex } from '../engine/keyField'
import { createEventEmitter } from '../utils/eventEmitter'
import { getPooledViewStyle, resolvePooledViewMode } from '../utils/viewStyle'
import { createDynamicScrollerItemController } from './dynamicScrollerMeasurement'
import { createDynamicScrollerMeasureQueue } from './dynamicScrollerMeasureQueue'
import { resolveScrollerOptions } from './scrollerOptions'
import { useRecycleScroller } from './useRecycleScroller'

export interface UseDynamicScrollerItemViewBindingOptions<TItem = unknown, TKey = KeyValue> {
  view: DynamicScrollerView<TItem, TKey>
  watchData?: boolean
  /**
   * @deprecated `sizeDependencies` is a legacy fallback for environments without
   * `ResizeObserver` and will be removed in the next major release.
   */
  sizeDependencies?: Record<string, unknown> | unknown[] | null
  emitResize?: boolean
  onResize?: DynamicScrollerItemControllerCallbacks['onResize']
}

interface UseDynamicScrollerItemLegacyBindingOptions<TItem = unknown> extends Omit<DynamicScrollerItemControllerOptions<TItem>, 'watchData' | 'emitResize'> {
  watchData?: boolean
  emitResize?: boolean
  onResize?: DynamicScrollerItemControllerCallbacks['onResize']
}

export type UseDynamicScrollerItemBindingOptions<TItem = unknown, TKey = KeyValue>
  = | UseDynamicScrollerItemViewBindingOptions<TItem, TKey>
    | UseDynamicScrollerItemLegacyBindingOptions<TItem>

export interface UseDynamicScrollerOptions<TItem = unknown> {
  items: MaybeRefOrGetter<TItem[]>
  keyField: KeyFieldValue<TItem>
  direction?: ScrollDirection
  minItemSize: number | string
  el: MaybeRefOrGetter<HTMLElement | undefined>
  before?: MaybeRefOrGetter<HTMLElement | undefined>
  after?: MaybeRefOrGetter<HTMLElement | undefined>
  buffer?: number
  pageMode?: boolean
  shift?: boolean
  cache?: CacheSnapshot
  disableTransform?: boolean
  flowMode?: boolean
  hiddenPosition?: number
  prerender?: number
  emitUpdate?: boolean
  updateInterval?: number
  onResize?: () => void
  onVisible?: () => void
  onHidden?: () => void
  onUpdate?: (startIndex: number, endIndex: number, visibleStartIndex: number, visibleEndIndex: number) => void
}

type UseDynamicScrollerRecycleReturn<TItem, TKey> = UseRecycleScrollerReturn<ItemWithSize<TItem, TKey>, TKey>
type UseDynamicScrollerSizes<TItem, TKey> = UseDynamicScrollerRecycleReturn<TItem, TKey>['sizes']
type UseDynamicScrollerReady<TItem, TKey> = UseDynamicScrollerRecycleReturn<TItem, TKey>['ready']
type UseDynamicScrollerPool<TItem, TKey> = Ref<Array<DynamicScrollerView<TItem, TKey>>>
type UseDynamicScrollerVisiblePool<TItem, TKey> = ComputedRef<Array<DynamicScrollerView<TItem, TKey>>>
type UseDynamicScrollerHandleResize<TItem, TKey> = UseDynamicScrollerRecycleReturn<TItem, TKey>['handleResize']
type UseDynamicScrollerHandleVisibilityChange<TItem, TKey> = UseDynamicScrollerRecycleReturn<TItem, TKey>['handleVisibilityChange']
type UseDynamicScrollerGetScroll<TItem, TKey> = UseDynamicScrollerRecycleReturn<TItem, TKey>['getScroll']
type UseDynamicScrollerFindItemIndex<TItem, TKey> = UseDynamicScrollerRecycleReturn<TItem, TKey>['findItemIndex']
type UseDynamicScrollerGetItemOffset<TItem, TKey> = UseDynamicScrollerRecycleReturn<TItem, TKey>['getItemOffset']
type UseDynamicScrollerScrollToItem<TItem, TKey> = UseDynamicScrollerRecycleReturn<TItem, TKey>['scrollToItem']
type UseDynamicScrollerScrollToPosition<TItem, TKey> = UseDynamicScrollerRecycleReturn<TItem, TKey>['scrollToPosition']
type UseDynamicScrollerSortViews<TItem, TKey> = UseDynamicScrollerRecycleReturn<TItem, TKey>['sortViews']
type UseDynamicScrollerTotalSize<TItem, TKey> = UseDynamicScrollerRecycleReturn<TItem, TKey>['totalSize']
type UseDynamicScrollerUpdateVisibleItems<TItem, TKey> = UseDynamicScrollerRecycleReturn<TItem, TKey>['updateVisibleItems']
type UseDynamicScrollerCacheSnapshot<TItem, TKey> = UseDynamicScrollerRecycleReturn<TItem, TKey>['cacheSnapshot']
type UseDynamicScrollerRestoreCache<TItem, TKey> = UseDynamicScrollerRecycleReturn<TItem, TKey>['restoreCache']

type ResolvedDynamicScrollerItems<TOptions extends UseDynamicScrollerOptions<any>>
  = TOptions['items'] extends MaybeRefOrGetter<infer TItems extends any[]> ? TItems : never
type InferredDynamicScrollerItem<TOptions extends UseDynamicScrollerOptions<any>> = ResolvedDynamicScrollerItems<TOptions>[number]
type InferredDynamicScrollerKeyField<TOptions extends UseDynamicScrollerOptions<any>>
  = Extract<TOptions['keyField'], KeyFieldValue<InferredDynamicScrollerItem<TOptions>>>

export interface UseDynamicScrollerReturn<TItem = unknown, TKey = ItemKey<TItem>> {
  vscrollData: VScrollData
  itemsWithSize: ComputedRef<Array<ItemWithSize<TItem, TKey>>>
  simpleArray: ComputedRef<boolean>
  resizeObserver: ResizeObserver | undefined
  measurementContext: DynamicScrollerMeasurementContext
  vDynamicScrollerItem: Directive<HTMLElement, UseDynamicScrollerItemBindingOptions<TItem, TKey>>
  pool: UseDynamicScrollerPool<TItem, TKey>
  visiblePool: UseDynamicScrollerVisiblePool<TItem, TKey>
  totalSize: UseDynamicScrollerTotalSize<TItem, TKey>
  startSpacerSize: UseDynamicScrollerRecycleReturn<TItem, TKey>['startSpacerSize']
  endSpacerSize: UseDynamicScrollerRecycleReturn<TItem, TKey>['endSpacerSize']
  ready: UseDynamicScrollerReady<TItem, TKey>
  sizes: UseDynamicScrollerSizes<TItem, TKey>
  forceUpdate: (clear?: boolean) => void
  scrollToItem: UseDynamicScrollerScrollToItem<TItem, TKey>
  scrollToPosition: UseDynamicScrollerScrollToPosition<TItem, TKey>
  getScroll: UseDynamicScrollerGetScroll<TItem, TKey>
  findItemIndex: UseDynamicScrollerFindItemIndex<TItem, TKey>
  getItemOffset: UseDynamicScrollerGetItemOffset<TItem, TKey>
  updateVisibleItems: UseDynamicScrollerUpdateVisibleItems<TItem, TKey>
  handleResize: UseDynamicScrollerHandleResize<TItem, TKey>
  handleVisibilityChange: UseDynamicScrollerHandleVisibilityChange<TItem, TKey>
  sortViews: UseDynamicScrollerSortViews<TItem, TKey>
  cacheSnapshot: UseDynamicScrollerCacheSnapshot<TItem, TKey>
  restoreCache: UseDynamicScrollerRestoreCache<TItem, TKey>
  getItemSize: (item: TItem, index?: number) => number
  getViewStyle: (view: DynamicScrollerView<TItem, TKey>) => CSSProperties
  scrollToBottom: () => void
  onScrollerResize: () => void
  onScrollerVisible: () => void
}

interface BoundDynamicScrollerItemOptions<TItem = unknown> extends DynamicScrollerItemControllerOptions<TItem> {
  onResize?: DynamicScrollerItemControllerCallbacks['onResize']
}

interface DynamicScrollerItemBindingRecord<TItem = unknown, TKey = KeyValue> {
  binding: ReturnType<typeof shallowRef<UseDynamicScrollerItemBindingOptions<TItem, TKey>>>
  scope: ReturnType<typeof effectScope>
  options: BoundDynamicScrollerItemOptions<TItem>
  callbacks: DynamicScrollerItemControllerCallbacks
  el: ReturnType<typeof shallowRef<HTMLElement | undefined>>
  controller: ReturnType<typeof createDynamicScrollerItemController>
  restoreStyles: Record<string, string>
}

type VScrollUpdateHandler = (payload?: unknown) => void

interface DynamicScrollerEvents {
  'vscroll:update': DynamicScrollerUpdatePayload
}

interface DynamicScrollerAnchorRecord {
  active: boolean
  id: KeyValue
}

interface DynamicScrollerShiftAnchor<TKey = KeyValue> {
  logicalKey: TKey
  logicalOffset: number
  pendingKeys: Set<TKey>
  stableFrames: number
  visualKey: TKey | null
  visualOffset: number
}

interface DynamicScrollerViewportAnchor<TKey = KeyValue> {
  key: TKey
  offset: number
}

type RawDynamicScrollerView<TItem = unknown, TKey = KeyValue> = View<ItemWithSize<TItem, TKey>, TKey>

const SCROLL_MEASURE_IDLE_MS = 120

/**
 * Touch array slots so computed wrappers react to shallow list mutations such as
 * push, splice, reorder, or item replacement without deep-watching item fields.
 */
function trackArrayShallowMutations<TItem>(items: TItem[]) {
  for (let index = 0; index < items.length; index++) {
    // eslint-disable-next-line ts/no-unused-expressions
    items[index]
  }
}

/**
 * Resolve internal size-tracking state from raw recycle view.
 */
function rawViewItemWithSize<TItem, TKey>(view: RawDynamicScrollerView<TItem, TKey>) {
  return view.item
}

/**
 * Resolve public dynamic view back to raw recycle view when internal helpers
 * need recycler metadata such as `nr` or style stamps.
 */
function unwrapDynamicScrollerView<TItem, TKey>(
  view: DynamicScrollerView<TItem, TKey>,
  rawViews: WeakMap<DynamicScrollerView<any, any>, RawDynamicScrollerView<any, any>>,
): RawDynamicScrollerView<TItem, TKey> {
  const rawView = rawViews.get(view)
  if (rawView) {
    return rawView as RawDynamicScrollerView<TItem, TKey>
  }

  return view as unknown as RawDynamicScrollerView<TItem, TKey>
}

/**
 * Build one stable public wrapper per raw pooled view so templates can render
 * flattened fields without losing recycled-view identity.
 */
function createDynamicScrollerPublicView<TItem, TKey>(
  rawView: RawDynamicScrollerView<TItem, TKey>,
): DynamicScrollerView<TItem, TKey> {
  const publicView = {} as DynamicScrollerView<TItem, TKey>

  Object.defineProperties(publicView, {
    item: {
      enumerable: true,
      get: () => rawView.item.item,
    },
    itemWithSize: {
      enumerable: true,
      get: () => rawView.item,
    },
    size: {
      enumerable: true,
      get: () => rawView.item.size,
    },
    position: {
      enumerable: true,
      get: () => rawView.position,
    },
    offset: {
      enumerable: true,
      get: () => rawView.offset,
    },
    id: {
      enumerable: true,
      get: () => rawView.nr.id,
    },
    index: {
      enumerable: true,
      get: () => rawView.nr.index,
    },
    used: {
      enumerable: true,
      get: () => rawView.nr.used,
    },
    key: {
      enumerable: true,
      get: () => rawView.nr.key,
    },
    type: {
      enumerable: true,
      get: () => rawView.nr.type,
    },
  })

  return publicView
}

function getViewStyleStamp<TItem, TKey>(view: View<TItem, TKey>) {
  return ((view as View<TItem, TKey> & { _vs_styleStamp?: number })._vs_styleStamp) ?? 0
}

function getViewVisibilityStamp<TItem, TKey>(view: View<TItem, TKey>) {
  return ((view as View<TItem, TKey> & { _vs_visibilityStamp?: number })._vs_visibilityStamp) ?? 0
}

const MANAGED_STYLE_PROPS = [
  'position',
  'top',
  'left',
  'transform',
  'willChange',
  'visibility',
  'pointerEvents',
  'display',
] as const

function captureManagedStyles(elValue: HTMLElement) {
  const snapshot: Record<string, string> = {}
  for (const prop of MANAGED_STYLE_PROPS) {
    snapshot[prop] = elValue.style[prop]
  }
  return snapshot
}

function restoreManagedStyles(elValue: HTMLElement, snapshot: Record<string, string>) {
  for (const prop of MANAGED_STYLE_PROPS) {
    elValue.style[prop] = snapshot[prop] ?? ''
  }
}

function setManagedStyle(elValue: HTMLElement, prop: (typeof MANAGED_STYLE_PROPS)[number], value: string) {
  if (elValue.style[prop] !== value) {
    elValue.style[prop] = value
  }
}

function applyViewStyles(
  elValue: HTMLElement,
  binding: UseDynamicScrollerItemBindingOptions<any, any>,
  direction: ScrollDirection,
  disableTransform: boolean,
  flowMode: boolean,
  snapshot: Record<string, string>,
  rawViews: WeakMap<DynamicScrollerView<any, any>, RawDynamicScrollerView<any, any>>,
) {
  if (!('view' in binding)) {
    restoreManagedStyles(elValue, snapshot)
    return
  }

  const isTableRow = elValue.tagName === 'TR'
  const mode = flowMode
    ? resolvePooledViewMode({
        direction,
        flowMode: true,
      })
    : resolvePooledViewMode({
        direction,
        disableTransform: disableTransform || isTableRow,
      })
  const style = getPooledViewStyle(unwrapDynamicScrollerView(binding.view, rawViews), {
    direction,
    mode,
  })

  // Skip redundant inline style writes. Even writing the same value again was
  // enough to keep style recalculation noisy in the scroll traces.
  setManagedStyle(elValue, 'position', String(style.position ?? ''))
  setManagedStyle(elValue, 'top', String(style.top ?? ''))
  setManagedStyle(elValue, 'left', String(style.left ?? ''))
  setManagedStyle(elValue, 'transform', mode === 'flow' || isTableRow ? '' : String(style.transform ?? ''))
  setManagedStyle(elValue, 'willChange', String(style.willChange ?? ''))
  setManagedStyle(elValue, 'visibility', String(style.visibility ?? ''))
  setManagedStyle(elValue, 'pointerEvents', String(style.pointerEvents ?? ''))
  setManagedStyle(elValue, 'display', String(style.display ?? ''))
}

function shouldTrackViewGeometry(
  binding: UseDynamicScrollerItemBindingOptions<any, any>,
  flowMode: boolean,
) {
  return 'view' in binding && !flowMode
}

/**
 * Resolve only the reactive state needed to keep anchor ownership current.
 */
function getBindingAnchorState<TItem>(
  binding: UseDynamicScrollerItemBindingOptions<TItem, any>,
  bindingOptions: BoundDynamicScrollerItemOptions<TItem>,
  keyField: KeyFieldValue<TItem>,
  simpleArray: boolean,
  active: boolean,
  rawViews: WeakMap<DynamicScrollerView<any, any>, RawDynamicScrollerView<any, any>>,
) {
  if ('view' in binding) {
    const rawView = unwrapDynamicScrollerView(binding.view, rawViews)
    return {
      active: rawView.nr.used && active,
      id: rawViewItemWithSize(rawView).id,
    }
  }

  return {
    active: bindingOptions.active && active,
    id: getDynamicItemId(
      bindingOptions.item,
      keyField,
      simpleArray,
      bindingOptions.index,
    ),
  }
}

/**
 * Resolve only the reactive state needed to keep pooled row styles in sync.
 */
function getBindingStyleState(
  binding: UseDynamicScrollerItemBindingOptions<any, any>,
  direction: ScrollDirection,
  flowMode: boolean,
  rawViews: WeakMap<DynamicScrollerView<any, any>, RawDynamicScrollerView<any, any>>,
) {
  if (!('view' in binding)) {
    return {
      direction,
      flowMode,
      legacy: true,
    }
  }

  if (flowMode) {
    const rawView = unwrapDynamicScrollerView(binding.view, rawViews)
    // Native-flow rows only need to wake the style watcher when their parked /
    // visible state changes. Tracking generic style stamps here caused many
    // pointless applyViewStyles runs during recycled rebinding.
    return {
      direction,
      flowMode,
      legacy: false,
      visibilityStamp: getViewVisibilityStamp(rawView),
    }
  }

  const rawView = unwrapDynamicScrollerView(binding.view, rawViews)
  return {
    active: rawView.nr.used,
    direction,
    flowMode,
    legacy: false,
    styleStamp: getViewStyleStamp(rawView),
    position: shouldTrackViewGeometry(binding, flowMode) ? rawView.position : null,
    offset: shouldTrackViewGeometry(binding, flowMode) ? rawView.offset : null,
  }
}

function normalizeBindingOptions<TItem, TKey>(
  options: UseDynamicScrollerItemBindingOptions<TItem, TKey>,
  rawViews: WeakMap<DynamicScrollerView<any, any>, RawDynamicScrollerView<any, any>>,
): BoundDynamicScrollerItemOptions<TItem> {
  if ('view' in options) {
    const rawView = unwrapDynamicScrollerView(options.view, rawViews)
    const itemWithSize = rawViewItemWithSize(rawView)
    return {
      item: itemWithSize.item,
      active: rawView.nr.used,
      index: rawView.nr.index,
      watchData: options.watchData ?? false,
      emitResize: options.emitResize ?? false,
      sizeDependencies: options.sizeDependencies ?? null,
      onResize: options.onResize,
    }
  }

  return {
    watchData: false,
    emitResize: false,
    sizeDependencies: null,
    ...options,
  }
}

/**
 * Patch controller-facing binding options without replacing the reactive object.
 */
function syncBoundDynamicScrollerItemOptions<TItem>(
  target: BoundDynamicScrollerItemOptions<TItem>,
  source: BoundDynamicScrollerItemOptions<TItem>,
) {
  if (target.item !== source.item) {
    target.item = source.item
  }
  if (target.active !== source.active) {
    target.active = source.active
  }
  if (target.index !== source.index) {
    target.index = source.index
  }
  if (target.watchData !== source.watchData) {
    target.watchData = source.watchData
  }
  if (target.sizeDependencies !== source.sizeDependencies) {
    target.sizeDependencies = source.sizeDependencies
  }
  if (target.emitResize !== source.emitResize) {
    target.emitResize = source.emitResize
  }
  if (target.onResize !== source.onResize) {
    target.onResize = source.onResize
  }
}

/**
 * Patch resize callback state without allocating a fresh wrapper object.
 */
function syncDynamicScrollerCallbacks(
  target: DynamicScrollerItemControllerCallbacks,
  source: BoundDynamicScrollerItemOptions<any>,
) {
  if (target.onResize !== source.onResize) {
    target.onResize = source.onResize
  }
}

function getDynamicItemId<TItem, TKeyField extends KeyFieldValue<TItem>>(
  item: TItem,
  keyField: KeyFieldValue<TItem>,
  simpleArray: boolean,
  index?: number,
): ItemKey<TItem, TKeyField> | null {
  if (simpleArray) {
    if (index == null) {
      return null
    }
    return index as ItemKey<TItem, TKeyField>
  }

  return resolveItemKeyWithOptionalIndex(item, index, keyField) as ItemKey<TItem, TKeyField>
}

export function useDynamicScroller<TItem, TKeyField extends KeyFieldValue<TItem> = DefaultKeyField<TItem>>(
  options: MaybeRefOrGetter<UseDynamicScrollerOptions<TItem> & {
    keyField: ValidKeyField<TItem, TKeyField>
  }>,
): UseDynamicScrollerReturn<TItem, ItemKey<TItem, TKeyField>>
export function useDynamicScroller<TOptions extends UseDynamicScrollerOptions<any>>(
  options: MaybeRefOrGetter<TOptions>,
): UseDynamicScrollerReturn<
  InferredDynamicScrollerItem<TOptions>,
  ItemKey<InferredDynamicScrollerItem<TOptions>, InferredDynamicScrollerKeyField<TOptions>>
>
export function useDynamicScroller<TOptions extends UseDynamicScrollerOptions<any>>(
  options: MaybeRefOrGetter<TOptions>,
): UseDynamicScrollerReturn<
  InferredDynamicScrollerItem<TOptions>,
  ItemKey<InferredDynamicScrollerItem<TOptions>, InferredDynamicScrollerKeyField<TOptions>>
> {
  type TItem = InferredDynamicScrollerItem<TOptions>
  type TKeyField = InferredDynamicScrollerKeyField<TOptions>
  const resolvedOptions = resolveScrollerOptions(options)

  // Internal state (non-reactive)
  let _undefinedSizes = 0
  let _undefinedMap: Record<KeyValue, boolean | undefined> = {}
  const _events = createEventEmitter<DynamicScrollerEvents>()
  let _scrollingToBottom = false
  let _resizeObserver: ResizeObserver | undefined
  let _applyingShiftAnchor = false
  let _previousKeys: Array<ItemKey<TItem, TKeyField>> = []
  let _pendingViewportAnchor: DynamicScrollerViewportAnchor<ItemKey<TItem, TKeyField>> | null = null
  let _shiftAnchor: DynamicScrollerShiftAnchor<ItemKey<TItem, TKeyField>> | null = null
  let _shiftAnchorRaf: number | null = null
  let _measureResumeTimer: ReturnType<typeof setTimeout> | null = null
  const _rafIds = new Set<number>()
  const _itemsWithSizeEntries: Array<ItemWithSize<TItem, ItemKey<TItem, TKeyField>>> = []

  // Reactive state
  const vscrollData = reactive<VScrollData>({
    active: true,
    sizes: {},
    keyField: getOptions().keyField,
    simpleArray: false,
  })

  const items = computed(() => {
    const currentItems = toValue(getOptions().items)
    trackArrayShallowMutations(currentItems)
    return currentItems
  })
  const direction = computed<ScrollDirection>(() => getOptions().direction ?? 'vertical')
  const el = computed(() => toValue(getOptions().el))
  const before = computed(() => toValue(getOptions().before))
  const after = computed(() => toValue(getOptions().after))
  const anchorRegistry = new Map<HTMLElement, DynamicScrollerAnchorRecord>()

  /**
   * Resolve current single-object options through cached computed state.
   */
  function getOptions() {
    return resolvedOptions.value
  }

  function requestFrame(cb: () => void): number {
    let frameId = -1
    frameId = requestAnimationFrame(() => {
      _rafIds.delete(frameId)
      cb()
    })
    _rafIds.add(frameId)
    return frameId
  }

  function cancelPendingFrames() {
    for (const frameId of _rafIds) {
      cancelAnimationFrame(frameId)
    }
    _rafIds.clear()
  }

  function clearMeasureResumeTimer() {
    if (_measureResumeTimer != null) {
      clearTimeout(_measureResumeTimer)
      _measureResumeTimer = null
    }
  }

  const _measureQueue = createDynamicScrollerMeasureQueue({
    // Spread row measurement across frames so one huge flush cannot monopolize layout time.
    // The queue is also paused while the user is actively scrolling, then resumed once
    // the scroll stream goes idle, which kills the worst frame spikes.
    maxTasksPerFlush: 6,
    overflowQueueFlush(flush) {
      requestFrame(flush)
    },
  })

  // ResizeObserver setup
  if (typeof ResizeObserver !== 'undefined') {
    _resizeObserver = new ResizeObserver((entries) => {
      requestFrame(() => {
        if (!Array.isArray(entries)) {
          return
        }
        for (const entry of entries) {
          if (entry.target && (entry.target as any).$_vs_onResize) {
            let width: number, height: number
            if (entry.borderBoxSize) {
              const resizeObserverSize = entry.borderBoxSize[0]
              width = resizeObserverSize.inlineSize
              height = resizeObserverSize.blockSize
            }
            else {
              width = entry.contentRect.width
              height = entry.contentRect.height
            }
            ;(entry.target as any).$_vs_onResize((entry.target as any).$_vs_id, width, height)
          }
        }
      })
    })
  }

  const measurementContext: DynamicScrollerMeasurementContext = {
    vscrollData,
    resizeObserver: _resizeObserver,
    measureQueue: _measureQueue,
    direction,
    undefinedMap: _undefinedMap,
    undefinedSizeCount: {
      get value() { return _undefinedSizes },
      set value(value: number) { _undefinedSizes = value },
    },
    onVscrollUpdate(callback) {
      const handler: VScrollUpdateHandler = (payload) => {
        callback(payload as DynamicScrollerUpdatePayload)
      }
      _events.on('vscroll:update', handler)
      return () => _events.off('vscroll:update', handler)
    },
  }

  // Provide
  provide('vscrollData', vscrollData)
  provide('vscrollParent', {
    get $_undefinedSizes() { return _undefinedSizes },
    set $_undefinedSizes(v: number) { _undefinedSizes = v },
    get $_undefinedMap() { return _undefinedMap },
    set $_undefinedMap(v: Record<KeyValue, boolean | undefined>) { _undefinedMap = v },
    $_events: _events,
    direction,
  })
  provide('vscrollResizeObserver', _resizeObserver)
  provide('vscrollMeasurementContext', measurementContext)
  provide('vscrollAnchorRegistry', {
    delete(elValue: HTMLElement) {
      anchorRegistry.delete(elValue)
    },
    set(elValue: HTMLElement, value: DynamicScrollerAnchorRecord) {
      anchorRegistry.set(elValue, value)
    },
  })

  // Computed
  const simpleArray = computed(() => {
    const currentItems = items.value
    return currentItems.length > 0 && typeof currentItems[0] !== 'object'
  })

  const itemsWithSizeVersion = shallowRef(0)
  const itemsWithSize = shallowRef<Array<ItemWithSize<TItem, ItemKey<TItem, TKeyField>>>>(_itemsWithSizeEntries)

  watchEffect(() => {
    const viewportAnchor = _shiftAnchor || !el.value
      ? null
      : captureViewportAnchor(el.value.scrollTop, _itemsWithSizeEntries)
    const opts = getOptions()
    const keyField = opts.keyField
    const simple = simpleArray.value
    const sizes = vscrollData.sizes
    const currentItems = items.value
    const l = currentItems.length
    let changed = _itemsWithSizeEntries.length !== l
    for (let i = 0; i < l; i++) {
      const item = currentItems[i]
      const id = (simple ? i : resolveItemKey(item, i, keyField)) as ItemKey<TItem, TKeyField>
      let size: number | undefined = sizes[id]
      if (typeof size === 'undefined' && !_undefinedMap[id]) {
        size = 0
      }
      let entry = _itemsWithSizeEntries[i]
      if (!entry) {
        entry = shallowReactive({
          item,
          id,
          size,
        }) as ItemWithSize<TItem, ItemKey<TItem, TKeyField>>
        _itemsWithSizeEntries[i] = entry
        changed = true
        continue
      }
      if (entry.item !== item) {
        entry.item = item
        changed = true
      }
      if (entry.id !== id) {
        entry.id = id
        changed = true
      }
      if (entry.size !== size) {
        entry.size = size
        changed = true
      }
    }
    if (_itemsWithSizeEntries.length !== l) {
      _itemsWithSizeEntries.length = l
      changed = true
    }
    if (changed) {
      _pendingViewportAnchor = viewportAnchor
      itemsWithSizeVersion.value++
      triggerRef(itemsWithSize)
    }
  })

  /**
   * Resolve the row that currently owns the viewport top without cloning the whole list.
   */
  function captureViewportAnchor(
    scrollTop: number,
    entries: Array<ItemWithSize<TItem, ItemKey<TItem, TKeyField>>>,
  ): DynamicScrollerViewportAnchor<ItemKey<TItem, TKeyField>> | null {
    if (!entries.length) {
      return null
    }

    const minItemSize = getOptions().minItemSize as number
    let start = 0
    let lastStart = 0
    let lastKey = entries[0].id

    for (const entry of entries) {
      const size = entry.size || minItemSize
      const end = start + size
      lastStart = start
      lastKey = entry.id
      if (scrollTop < end) {
        return {
          key: entry.id,
          offset: scrollTop - start,
        }
      }
      start = end
    }

    return {
      key: lastKey,
      offset: Math.max(0, scrollTop - lastStart),
    }
  }

  const initialOpts = getOptions()
  _previousKeys = getItemKeys(items.value, simpleArray.value ? null : initialOpts.keyField) as Array<ItemKey<TItem, TKeyField>>
  if (initialOpts.cache) {
    vscrollData.sizes = restoreCacheMap(initialOpts.cache, items.value, simpleArray.value ? null : initialOpts.keyField)
  }

  function onScrollerHidden() {
    getOptions().onHidden?.()
  }

  function onScrollerUpdate(startIndex: number, endIndex: number, visibleStartIndex: number, visibleEndIndex: number) {
    getOptions().onUpdate?.(startIndex, endIndex, visibleStartIndex, visibleEndIndex)
  }

  const recycleOptions = reactive({
    get items() { return itemsWithSize.value },
    get keyField() { return 'id' as const },
    get direction() { return direction.value },
    get itemSize() { return null },
    get gridItems() { return undefined },
    get itemSecondarySize() { return undefined },
    get minItemSize() { return getOptions().minItemSize },
    get sizeField() { return 'size' as const },
    get typeField() { return 'type' },
    get buffer() { return getOptions().buffer ?? 200 },
    get pageMode() { return getOptions().pageMode ?? false },
    get shift() { return false },
    get cache() { return getOptions().cache },
    get prerender() { return getOptions().prerender ?? 0 },
    get emitUpdate() { return getOptions().emitUpdate ?? false },
    get disableTransform() { return getOptions().disableTransform ?? false },
    get flowMode() { return getOptions().flowMode ?? false },
    get hiddenPosition() { return getOptions().hiddenPosition },
    get updateInterval() { return getOptions().updateInterval ?? 0 },
    get el() { return el.value },
    get before() { return before.value },
    get after() { return after.value },
    get onResize() { return onScrollerResize },
    get onVisible() { return onScrollerVisible },
    get onHidden() { return onScrollerHidden },
    get onUpdate() { return onScrollerUpdate },
  }) as UseRecycleScrollerOptions<ItemWithSize<TItem, ItemKey<TItem, TKeyField>>, 'size'> & {
    keyField: 'id'
  }

  function onScrollerResize() {
    forceUpdate()
    getOptions().onResize?.()
  }

  function onScrollerVisible() {
    _events.emit('vscroll:update', { force: false })
    getOptions().onVisible?.()
  }

  const recycleScroller = useRecycleScroller<ItemWithSize<TItem, ItemKey<TItem, TKeyField>>, 'id', 'size'>(
    recycleOptions,
  )
  const rawViews = new WeakMap<DynamicScrollerView<TItem, ItemKey<TItem, TKeyField>>, RawDynamicScrollerView<TItem, ItemKey<TItem, TKeyField>>>()
  const publicViews = new WeakMap<RawDynamicScrollerView<TItem, ItemKey<TItem, TKeyField>>, DynamicScrollerView<TItem, ItemKey<TItem, TKeyField>>>()
  const pool = shallowRef<Array<DynamicScrollerView<TItem, ItemKey<TItem, TKeyField>>>>([])

  /**
   * Build inline styles for a pooled dynamic view.
   */
  function getViewStyle(
    view: DynamicScrollerView<TItem, ItemKey<TItem, TKeyField>>,
  ): CSSProperties {
    const opts = getOptions()
    return getPooledViewStyle(unwrapDynamicScrollerView(view, rawViews), {
      direction: direction.value,
      mode: resolvePooledViewMode({
        direction: direction.value,
        disableTransform: opts.disableTransform ?? false,
        flowMode: opts.flowMode ?? false,
      }),
    })
  }

  /**
   * Resolve cached public wrapper for one raw pooled view.
   */
  function resolvePublicView(
    rawView: RawDynamicScrollerView<TItem, ItemKey<TItem, TKeyField>>,
  ): DynamicScrollerView<TItem, ItemKey<TItem, TKeyField>> {
    let publicView = publicViews.get(rawView)
    if (!publicView) {
      publicView = createDynamicScrollerPublicView(rawView)
      publicViews.set(rawView, publicView)
      rawViews.set(publicView, rawView)
    }
    return publicView
  }

  watchEffect(() => {
    const rawPool = recycleScroller.pool.value
    const nextLength = rawPool.length
    const currentPool = pool.value
    let changed = currentPool.length !== nextLength

    for (let index = 0; index < nextLength; index++) {
      const publicView = resolvePublicView(rawPool[index])
      if (currentPool[index] !== publicView) {
        currentPool[index] = publicView
        changed = true
      }
    }

    if (currentPool.length !== nextLength) {
      currentPool.length = nextLength
      changed = true
    }

    if (changed) {
      triggerRef(pool)
    }
  })

  const visiblePool = computed(() =>
    recycleScroller.visiblePool.value.map(resolvePublicView),
  ) as ComputedRef<Array<DynamicScrollerView<TItem, ItemKey<TItem, TKeyField>>>>

  const bindings = new WeakMap<HTMLElement, DynamicScrollerItemBindingRecord<TItem, ItemKey<TItem, TKeyField>>>()

  function cancelShiftAnchorFrame() {
    if (_shiftAnchorRaf != null) {
      cancelAnimationFrame(_shiftAnchorRaf)
      _rafIds.delete(_shiftAnchorRaf)
      _shiftAnchorRaf = null
    }
  }

  function clearShiftAnchor() {
    cancelShiftAnchorFrame()
    _shiftAnchor = null
  }

  function scheduleShiftAnchorAlignment() {
    if (_shiftAnchor == null || _shiftAnchorRaf != null) {
      return
    }

    _shiftAnchorRaf = requestFrame(() => {
      _shiftAnchorRaf = null
      alignShiftAnchor()
    })
  }

  function findVisualAnchor() {
    const scrollerEl = el.value
    if (!scrollerEl) {
      return null
    }

    const viewportRect = scrollerEl.getBoundingClientRect()
    let best: { key: ItemKey<TItem, TKeyField>, offset: number, score: number } | null = null

    for (const [rowEl, record] of anchorRegistry.entries()) {
      if (!record.active || getComputedStyle(rowEl).visibility === 'hidden') {
        continue
      }

      const rect = rowEl.getBoundingClientRect()
      if (rect.bottom <= viewportRect.top || rect.top >= viewportRect.bottom) {
        continue
      }

      const score = Math.max(rect.top, viewportRect.top) - viewportRect.top
      if (!best || score < best.score) {
        best = {
          key: record.id as ItemKey<TItem, TKeyField>,
          offset: rect.top - viewportRect.top,
          score,
        }
      }
    }

    return best
  }

  function captureShiftAnchor(previousKeys: Array<ItemKey<TItem, TKeyField>>) {
    const scrollerEl = el.value
    if (!scrollerEl) {
      clearShiftAnchor()
      return
    }

    const scrollTop = scrollerEl.scrollTop
    const anchorIndex = Math.min(recycleScroller.findItemIndex(scrollTop), previousKeys.length - 1)
    const logicalKey = previousKeys[anchorIndex]
    if (logicalKey == null) {
      clearShiftAnchor()
      return
    }

    const visualAnchor = findVisualAnchor()
    _shiftAnchor = {
      logicalKey,
      logicalOffset: scrollTop - recycleScroller.getItemOffset(anchorIndex),
      pendingKeys: new Set<ItemKey<TItem, TKeyField>>(),
      stableFrames: 0,
      visualKey: visualAnchor?.key ?? null,
      visualOffset: visualAnchor?.offset ?? 0,
    }
  }

  function setScrollTop(target: number) {
    const scrollerEl = el.value
    if (!scrollerEl || Math.abs(scrollerEl.scrollTop - target) < 0.5) {
      return false
    }

    _applyingShiftAnchor = true
    scrollerEl.scrollTop = target
    // Keep the pooled window in sync immediately so prepend anchoring does not
    // expose one-frame overlaps while the native scroll event is still queued.
    recycleScroller.updateVisibleItems(true)
    scrollerEl.dispatchEvent(new Event('scroll'))
    requestFrame(() => {
      _applyingShiftAnchor = false
    })
    return true
  }

  function alignShiftAnchor() {
    const shiftAnchor = _shiftAnchor
    const scrollerEl = el.value
    if (!shiftAnchor || !scrollerEl) {
      return
    }

    const anchorIndex = itemsWithSize.value.findIndex(item => item.id === shiftAnchor.logicalKey)
    if (anchorIndex === -1) {
      clearShiftAnchor()
      return
    }

    let moved = false
    const target = recycleScroller.getItemOffset(anchorIndex) + shiftAnchor.logicalOffset
    moved = setScrollTop(target) || moved

    // Visual correction: use the actual DOM position of the anchor element to
    // fine-tune the scroll offset. This must only run when the logical scroll
    // did NOT move this frame. setScrollTop → updateVisibleItems updates
    // view.position reactively, but Vue flushes those changes in a microtask
    // (after this synchronous callback returns). Reading getBoundingClientRect
    // before that flush returns stale CSS transforms, which causes the visual
    // delta to undo the logical scroll and oscillate each frame. Gating on
    // !moved guarantees Vue has re-rendered since the last frame so the DOM
    // positions match the current reactive state.
    if (!moved && shiftAnchor.visualKey != null) {
      for (const [rowEl, record] of anchorRegistry.entries()) {
        if (!record.active || record.id !== shiftAnchor.visualKey || getComputedStyle(rowEl).visibility === 'hidden') {
          continue
        }

        const delta = rowEl.getBoundingClientRect().top - scrollerEl.getBoundingClientRect().top - shiftAnchor.visualOffset
        moved = setScrollTop(scrollerEl.scrollTop + delta) || moved
        break
      }
    }

    let allMeasured = true
    for (const key of shiftAnchor.pendingKeys) {
      if (!(typeof vscrollData.sizes[key] === 'number' && vscrollData.sizes[key] > 0)) {
        allMeasured = false
        break
      }
    }

    if (!moved && allMeasured) {
      shiftAnchor.stableFrames++
      if (shiftAnchor.stableFrames >= 2) {
        clearShiftAnchor()
        return
      }
    }
    else {
      shiftAnchor.stableFrames = 0
    }

    scheduleShiftAnchorAlignment()
  }

  function mountBinding(
    elValue: HTMLElement,
    bindingValue: UseDynamicScrollerItemBindingOptions<TItem, ItemKey<TItem, TKeyField>>,
    value: BoundDynamicScrollerItemOptions<TItem>,
    restoreStyles: Record<string, string>,
  ) {
    const scope = effectScope()
    const binding = shallowRef(bindingValue)
    const bindingOptions = shallowReactive({
      ...value,
    }) as BoundDynamicScrollerItemOptions<TItem>
    const callbacks = shallowReactive<DynamicScrollerItemControllerCallbacks>({
      onResize: value.onResize,
    })
    const elRef = shallowRef<HTMLElement | undefined>(elValue)
    const controller = scope.run(() => {
      watch(() => {
        return getBindingAnchorState(
          binding.value,
          bindingOptions,
          getOptions().keyField,
          vscrollData.simpleArray,
          vscrollData.active,
          rawViews,
        )
      }, () => {
        const currentEl = elRef.value
        if (currentEl) {
          const anchorState = getBindingAnchorState(
            binding.value,
            bindingOptions,
            getOptions().keyField,
            vscrollData.simpleArray,
            vscrollData.active,
            rawViews,
          )
          const currentId = anchorState.id
          if (currentId != null) {
            anchorRegistry.set(currentEl, {
              active: anchorState.active,
              id: currentId,
            })
          }
        }
      }, {
        immediate: true,
      })

      watch(() => {
        return getBindingStyleState(
          binding.value,
          direction.value,
          getOptions().flowMode ?? false,
          rawViews,
        )
      }, () => {
        const currentEl = elRef.value
        if (currentEl) {
          applyViewStyles(
            currentEl,
            binding.value,
            direction.value,
            getOptions().disableTransform ?? false,
            getOptions().flowMode ?? false,
            restoreStyles,
            rawViews,
          )
        }
      }, {
        immediate: true,
      })

      return createDynamicScrollerItemController(
        bindingOptions,
        elRef,
        measurementContext,
        callbacks,
      )
    })!

    controller.mount()

    bindings.set(elValue, {
      binding,
      scope,
      options: bindingOptions,
      callbacks,
      el: elRef,
      controller,
      restoreStyles,
    })
  }

  const vDynamicScrollerItem: Directive<HTMLElement, UseDynamicScrollerItemBindingOptions<TItem, ItemKey<TItem, TKeyField>>> = {
    mounted(elValue, binding) {
      const restoreStyles = captureManagedStyles(elValue)
      mountBinding(elValue, binding.value, normalizeBindingOptions(binding.value, rawViews), restoreStyles)
    },
    updated(elValue, binding) {
      const record = bindings.get(elValue)
      const normalizedValue = normalizeBindingOptions(binding.value, rawViews)

      if (!record) {
        const restoreStyles = captureManagedStyles(elValue)
        mountBinding(elValue, binding.value, normalizedValue, restoreStyles)
        return
      }

      const bindingChanged = record.binding.value !== binding.value
      if (bindingChanged) {
        record.binding.value = binding.value
      }
      syncBoundDynamicScrollerItemOptions(record.options, normalizedValue)
      syncDynamicScrollerCallbacks(record.callbacks, normalizedValue)
      if (record.el.value !== elValue) {
        record.el.value = elValue
      }
      if (bindingChanged) {
        applyViewStyles(
          elValue,
          binding.value,
          direction.value,
          getOptions().disableTransform ?? false,
          getOptions().flowMode ?? false,
          record.restoreStyles,
          rawViews,
        )
      }
    },
    unmounted(elValue) {
      const record = bindings.get(elValue)
      if (!record)
        return

      record.controller.unmount()
      record.scope.stop()
      restoreManagedStyles(elValue, record.restoreStyles)
      anchorRegistry.delete(elValue)
      bindings.delete(elValue)
    },
  }

  // Methods
  function forceUpdate(clear = false) {
    if (clear || simpleArray.value) {
      vscrollData.sizes = {}
    }
    _events.emit('vscroll:update', { force: true })
  }

  function scrollToItem(index: number, scrollOptions?: Parameters<UseRecycleScrollerReturn['scrollToItem']>[1]) {
    recycleScroller.scrollToItem(index, scrollOptions)
  }

  function restoreCache(snapshot: CacheSnapshot | null | undefined) {
    const opts = getOptions()
    vscrollData.sizes = restoreCacheMap(snapshot, items.value, simpleArray.value ? null : opts.keyField)
    return recycleScroller.restoreCache(snapshot)
  }

  function getItemSize(item: TItem, index?: number): number {
    const opts = getOptions()
    const resolvedIndex = index ?? items.value.indexOf(item)
    const id = simpleArray.value
      ? resolvedIndex
      : resolveItemKeyWithOptionalIndex(item, resolvedIndex >= 0 ? resolvedIndex : index, opts.keyField)
    return vscrollData.sizes[id] || 0
  }

  function scrollToBottom() {
    const elValue = el.value
    if (!elValue)
      return
    if (_scrollingToBottom)
      return
    _scrollingToBottom = true
    nextTick(() => {
      elValue.scrollTop = elValue.scrollHeight + 5000
      const cb = () => {
        elValue.scrollTop = elValue.scrollHeight + 5000
        requestFrame(() => {
          elValue.scrollTop = elValue.scrollHeight + 5000
          if (_undefinedSizes === 0) {
            _scrollingToBottom = false
          }
          else {
            requestFrame(cb)
          }
        })
      }
      requestFrame(cb)
    })
  }

  function onNativeScroll() {
    if (_shiftAnchor && !_applyingShiftAnchor) {
      clearShiftAnchor()
    }

    if (_applyingShiftAnchor) {
      return
    }

    // Measuring offsetHeight/offsetWidth mid-scroll caused the largest dropped
    // frames in the headless-table traces. Hold the queue during active scroll
    // and drain it after a short idle window instead.
    _measureQueue.pause()
    clearMeasureResumeTimer()
    _measureResumeTimer = setTimeout(() => {
      _measureResumeTimer = null
      _measureQueue.resume()
    }, SCROLL_MEASURE_IDLE_MS)
  }

  // Watchers
  watch(() => items.value.slice(), (nextItems, previousItems) => {
    const opts = getOptions()
    const keyField = simpleArray.value ? null : opts.keyField
    const nextKeys = getItemKeys(nextItems, keyField)

    if (opts.shift) {
      const previousKeys = previousItems
        ? getItemKeys(previousItems, keyField) as Array<ItemKey<TItem, TKeyField>>
        : _previousKeys
      const prependCount = findPrependOffset(previousKeys, nextKeys as Array<ItemKey<TItem, TKeyField>>)
      if (prependCount > 0) {
        captureShiftAnchor(previousKeys)
        if (_shiftAnchor) {
          _shiftAnchor.pendingKeys = new Set((nextKeys as Array<ItemKey<TItem, TKeyField>>).slice(0, prependCount))
          _shiftAnchor.stableFrames = 0
          nextTick(() => {
            if (_shiftAnchor) {
              alignShiftAnchor()
            }
          })
        }
      }
      else {
        clearShiftAnchor()
      }
    }
    else {
      clearShiftAnchor()
    }

    _previousKeys = nextKeys as Array<ItemKey<TItem, TKeyField>>
    forceUpdate()
  }, { flush: 'sync' })

  watch(() => getOptions().cache, (snapshot) => {
    if (snapshot) {
      restoreCache(snapshot)
    }
  })

  watch(() => getOptions().keyField, (keyField) => {
    vscrollData.keyField = keyField
    _previousKeys = getItemKeys(items.value, simpleArray.value ? null : keyField) as Array<ItemKey<TItem, TKeyField>>
    clearShiftAnchor()
    forceUpdate(true)
  }, { flush: 'sync' })

  watch(simpleArray, (value) => {
    vscrollData.simpleArray = value
  }, { immediate: true })

  watch(() => getOptions().direction, () => {
    clearShiftAnchor()
    forceUpdate(true)
  })

  watch(el, (nextEl, previousEl) => {
    previousEl?.removeEventListener('scroll', onNativeScroll)
    nextEl?.addEventListener('scroll', onNativeScroll)
  }, {
    immediate: true,
  })

  watch(itemsWithSizeVersion, () => {
    const elValue = el.value
    if (!elValue)
      return

    if (_shiftAnchor) {
      alignShiftAnchor()
      return
    }

    const viewportAnchor = _pendingViewportAnchor
    _pendingViewportAnchor = null
    if (!viewportAnchor) {
      return
    }

    const anchorIndex = itemsWithSize.value.findIndex(item => item.id === viewportAnchor.key)
    if (anchorIndex === -1) {
      return
    }

    const target = recycleScroller.getItemOffset(anchorIndex) + viewportAnchor.offset
    const offset = target - elValue.scrollTop
    if (offset === 0) {
      return
    }

    elValue.scrollTop = target
  }, { flush: 'post' })

  // Lifecycle
  onActivated(() => {
    vscrollData.active = true
    _measureQueue.resume()
  })

  onDeactivated(() => {
    vscrollData.active = false
    clearMeasureResumeTimer()
    _measureQueue.pause()
  })

  onUnmounted(() => {
    cancelShiftAnchorFrame()
    cancelPendingFrames()
    clearMeasureResumeTimer()
    el.value?.removeEventListener('scroll', onNativeScroll)
    _events.clear()
  })

  return {
    vscrollData,
    itemsWithSize: itemsWithSize as unknown as ComputedRef<Array<ItemWithSize<TItem, ItemKey<TItem, TKeyField>>>>,
    resizeObserver: _resizeObserver,
    measurementContext,
    vDynamicScrollerItem,
    ...recycleScroller,
    pool,
    visiblePool,
    simpleArray,
    forceUpdate,
    scrollToItem,
    restoreCache,
    getItemSize,
    getViewStyle,
    scrollToBottom,
    onScrollerResize,
    onScrollerVisible,
  }
}

import type { ComputedRef, CSSProperties, MaybeRefOrGetter, Ref } from 'vue'
import type { CacheSnapshot, DefaultKeyField, ItemKey, ItemSizeValue, KeyFieldValue, ScrollDirection, ScrollState, ScrollToOptions, Sizes, ValidKeyField, ValidSizeField, View, ViewNonReactive } from '../types'
import type { PooledViewPositionMode } from '../utils/viewStyle'
import type { ScrollerCallbacks, ScrollerOptionCallbacks, ScrollerOptionElements } from './scrollerOptions'
import { computed, markRaw, nextTick, onActivated, onBeforeUnmount, onMounted, ref, shallowReactive, toValue, watch } from 'vue'
import config from '../config'
import { buildCacheSnapshot, findPrependOffset, getAlignedScrollOffset, getItemKeys, restoreCacheMap } from '../engine/cache'
import { resolveItemKey } from '../engine/keyField'
import { getViewportSize, normalizeOffset, scrollElementTo } from '../engine/scroll'
import { getScrollParent } from '../scrollparent'
import { supportsPassive } from '../utils'
import { getFixedItemSize, resolveSnapshotItemSize, resolveVariableItemSize } from '../utils/itemSize'
import { getPooledViewStyle, resolvePooledViewMode } from '../utils/viewStyle'
import { normalizeScrollerInputs } from './scrollerOptions'

export interface UseRecycleScrollerOptions<TItem = unknown, TSizeField extends string = 'size'> extends ScrollerOptionElements, ScrollerOptionCallbacks {
  items: MaybeRefOrGetter<TItem[]>
  keyField: KeyFieldValue<TItem>
  direction?: ScrollDirection
  itemSize: ItemSizeValue<TItem>
  gridItems?: number
  itemSecondarySize?: number
  minItemSize: number | string | null
  sizeField?: ValidSizeField<TItem, TSizeField>
  typeField: string
  buffer: number
  pageMode: boolean
  shift?: boolean
  cache?: CacheSnapshot
  prerender: number
  emitUpdate: boolean
  disableTransform?: boolean
  flowMode?: boolean
  /**
   * Park recycled hidden views at custom main-axis position.
   */
  hiddenPosition?: number
  updateInterval: number
}

export interface UseRecycleScrollerReturn<TItem = unknown, TKey = ItemKey<TItem>> {
  pool: Ref<Array<View<TItem, TKey>>>
  visiblePool: ComputedRef<Array<View<TItem, TKey>>>
  totalSize: Ref<number>
  startSpacerSize: Ref<number>
  endSpacerSize: Ref<number>
  ready: Ref<boolean>
  sizes: ComputedRef<Sizes | never[]>
  simpleArray: ComputedRef<boolean>
  scrollToItem: (index: number, options?: ScrollToOptions) => void
  scrollToPosition: (position: number, options?: ScrollToOptions) => void
  getScroll: () => ScrollState
  findItemIndex: (offset: number) => number
  getItemOffset: (index: number) => number
  getItemSize: (index: number) => number
  getViewStyle: (view: View<TItem, TKey>) => CSSProperties
  cacheSnapshot: ComputedRef<CacheSnapshot>
  restoreCache: (snapshot: CacheSnapshot | null | undefined) => boolean
  updateVisibleItems: (itemsChanged: boolean, checkPositionDiff?: boolean) => { continuous: boolean }
  handleResize: () => void
  handleVisibilityChange: (isVisible: boolean, entry: IntersectionObserverEntry) => void
  sortViews: () => void
}

type ViewWithStyleStamp<TItem = unknown, TKey = ItemKey<TItem>> = View<TItem, TKey> & {
  _vs_styleStamp: number
}

let uid = 0

function touchView<TItem, TKey>(view: View<TItem, TKey>) {
  const stampedView = view as ViewWithStyleStamp<TItem, TKey>
  stampedView._vs_styleStamp++
}

interface GridRenderWindow {
  renderedIndices: number[]
  startIndex: number
  endIndex: number
  visibleStartIndex: number
  visibleEndIndex: number
  totalSize: number
}

interface RenderWindowRange {
  startIndex: number
  endIndex: number
  visibleStartIndex: number
  visibleEndIndex: number
}

interface FlowWindowEdges {
  rawViewportStart: number
  rawViewportEnd: number
  renderStart: number
  renderEnd: number
}

const FLOW_IDLE_HYSTERESIS_PX = 8
const FLOW_IDLE_SCROLL_EPSILON_PX = 1

type ResolvedRecycleScrollerItems<TOptions extends UseRecycleScrollerOptions<any, any>>
  = TOptions['items'] extends MaybeRefOrGetter<infer TItems extends any[]> ? TItems : never
type InferredRecycleScrollerItem<TOptions extends UseRecycleScrollerOptions<any, any>> = ResolvedRecycleScrollerItems<TOptions>[number]
type InferredRecycleScrollerKeyField<TOptions extends UseRecycleScrollerOptions<any, any>>
  = Extract<TOptions['keyField'], KeyFieldValue<InferredRecycleScrollerItem<TOptions>>>

export function useRecycleScroller<TItem, TKeyField extends KeyFieldValue<TItem> = DefaultKeyField<TItem>, TSizeField extends string = 'size'>(
  options: MaybeRefOrGetter<UseRecycleScrollerOptions<TItem, TSizeField> & {
    keyField: ValidKeyField<TItem, TKeyField>
  }>,
  el?: MaybeRefOrGetter<HTMLElement | undefined>,
  before?: MaybeRefOrGetter<HTMLElement | undefined>,
  after?: MaybeRefOrGetter<HTMLElement | undefined>,
  callbacks?: ScrollerCallbacks,
): UseRecycleScrollerReturn<TItem, ItemKey<TItem, TKeyField>>
export function useRecycleScroller<TOptions extends UseRecycleScrollerOptions<any, any>>(
  options: MaybeRefOrGetter<TOptions>,
  el?: MaybeRefOrGetter<HTMLElement | undefined>,
  before?: MaybeRefOrGetter<HTMLElement | undefined>,
  after?: MaybeRefOrGetter<HTMLElement | undefined>,
  callbacks?: ScrollerCallbacks,
): UseRecycleScrollerReturn<
  InferredRecycleScrollerItem<TOptions>,
  ItemKey<InferredRecycleScrollerItem<TOptions>, InferredRecycleScrollerKeyField<TOptions>>
>
export function useRecycleScroller<TOptions extends UseRecycleScrollerOptions<any, any>>(
  options: MaybeRefOrGetter<TOptions>,
  el?: MaybeRefOrGetter<HTMLElement | undefined>,
  before?: MaybeRefOrGetter<HTMLElement | undefined>,
  after?: MaybeRefOrGetter<HTMLElement | undefined>,
  callbacks?: ScrollerCallbacks,
  overrides?: {
    pageMode?: boolean
  },
): UseRecycleScrollerReturn<
  InferredRecycleScrollerItem<TOptions>,
  ItemKey<InferredRecycleScrollerItem<TOptions>, InferredRecycleScrollerKeyField<TOptions>>
> {
  type TItem = InferredRecycleScrollerItem<TOptions>
  type TKeyField = InferredRecycleScrollerKeyField<TOptions>

  const normalizedInputs = normalizeScrollerInputs(options, el, before, after, callbacks)
  const items = computed(() => toValue(toValue(options).items))

  // Reactive state
  const pool = ref<Array<View<TItem, ItemKey<TItem, TKeyField>>>>([]) as Ref<Array<View<TItem, ItemKey<TItem, TKeyField>>>>
  const totalSize = ref(0)
  const startSpacerSize = ref(0)
  const endSpacerSize = ref(0)
  const ready = ref(false)

  // Internal state (non-reactive)
  let _startIndex = 0
  let _endIndex = 0
  let _visibleStartIndex = 0
  let _visibleEndIndex = 0
  let _hasWindowState = false
  const _views = new Map<ItemKey<TItem, TKeyField>, View<TItem, ItemKey<TItem, TKeyField>>>()
  const _recycledPools = new Map<unknown, Array<View<TItem, ItemKey<TItem, TKeyField>>>>()
  let _scrollDirty = false
  let _lastUpdateScrollPosition = 0
  let _lastUpdateSecondaryScrollPosition = 0
  let _prerender = false
  let _updateTimeout: ReturnType<typeof setTimeout> | null = null
  let _refreshTimout: ReturnType<typeof setTimeout> | null = null
  let _sortTimer: ReturnType<typeof setTimeout> | null = null
  let _computedMinItemSize = 0
  let _scrollListenerTarget: (Window | Element) | null = null
  let _resizeListenerTarget: (Window | Element) | null = null
  let _previousKeys: Array<ItemKey<TItem, TKeyField>> = []
  let _shiftAnchor: { key: ItemKey<TItem, TKeyField>, offset: number } | null = null
  let _shiftAnchorClearTimer: ReturnType<typeof setTimeout> | null = null
  let _itemsLimitWarnTimer: ReturnType<typeof setTimeout> | null = null
  let _applyingShiftAnchor = false
  let _flowModeDirectionWarned = false
  let _flowModeGridWarned = false
  const _rafIds = new Set<number>()
  const _restoredSizes = ref<Record<ItemKey<TItem, TKeyField>, number>>({} as Record<ItemKey<TItem, TKeyField>, number>)

  /**
   * Resolve current option object without collapsing hot-path inputs into one aggregate computed.
   */
  function getOptions() {
    return toValue(options)
  }

  /**
   * Resolve effective page mode, including wrapper overrides such as `useWindowScroller`.
   */
  function getPageMode() {
    return overrides?.pageMode ?? getOptions().pageMode
  }

  // Computed
  const simpleArray = computed(() => {
    const currentItems = items.value
    return currentItems.length > 0 && typeof currentItems[0] !== 'object'
  })

  const sizes = computed<Sizes | never[]>(() => {
    const opts = getOptions()
    const fixedItemSize = getFixedItemSize(opts.itemSize)
    if (fixedItemSize === null) {
      const sizes: Sizes = {
        [-1]: { accumulator: 0 },
      }
      const currentItems = items.value
      const minItemSize = opts.minItemSize as number
      const restoredSizes = _restoredSizes.value
      let computedMinSize = 10000
      let accumulator = 0
      let current: number
      for (let i = 0, l = currentItems.length; i < l; i++) {
        const key = simpleArray.value ? i : resolveItemKey(currentItems[i], i, opts.keyField)
        current = resolveVariableItemSize(
          currentItems[i],
          i,
          opts.itemSize,
          restoredSizes[key],
          minItemSize,
          opts.sizeField,
        )
        if (current < computedMinSize) {
          computedMinSize = current
        }
        accumulator += current
        sizes[i] = { accumulator, size: current }
      }
      _computedMinItemSize = computedMinSize
      return sizes
    }
    return []
  })

  const visiblePool = computed(() =>
    pool.value
      .filter(view => view.nr.used)
      .sort((a, b) => a.nr.index - b.nr.index),
  )

  const cacheSnapshot = computed<CacheSnapshot>(() => {
    const opts = getOptions()
    const keyField = simpleArray.value ? null : opts.keyField
    return buildCacheSnapshot(items.value, keyField, (item, index, key) => {
      return resolveSnapshotItemSize(
        item as TItem,
        index,
        opts.itemSize,
        _restoredSizes.value[key as ItemKey<TItem, TKeyField>],
        opts.sizeField,
      )
    })
  })

  function getDirection(opts = getOptions()): ScrollDirection {
    return opts.direction ?? 'vertical'
  }

  /**
   * Warn once for unsupported flow-mode combinations and resolve actual mode.
   */
  function getViewPositionMode(opts = getOptions()): PooledViewPositionMode {
    const direction = getDirection(opts)
    let flowMode = opts.flowMode ?? false

    if (flowMode && direction !== 'vertical') {
      if (!_flowModeDirectionWarned) {
        console.warn('[vue-recycle-scroller] flowMode only supports vertical lists. Falling back to standard positioning.')
        _flowModeDirectionWarned = true
      }
      flowMode = false
    }

    if (flowMode && opts.gridItems) {
      if (!_flowModeGridWarned) {
        console.warn('[vue-recycle-scroller] flowMode does not support gridItems. Falling back to standard positioning.')
        _flowModeGridWarned = true
      }
      flowMode = false
    }

    return resolvePooledViewMode({
      direction,
      disableTransform: opts.disableTransform ?? false,
      flowMode,
      gridItems: opts.gridItems,
    })
  }

  /**
   * Keep active views first in DOM order for native-flow rendering.
   */
  function sortFlowModePool() {
    pool.value.sort((viewA, viewB) => {
      if (viewA.nr.used !== viewB.nr.used) {
        return viewA.nr.used ? -1 : 1
      }

      if (viewA.nr.used && viewB.nr.used) {
        return viewA.nr.index - viewB.nr.index
      }

      return viewA.nr.id - viewB.nr.id
    })
  }

  // Methods
  function restoreCache(snapshot: CacheSnapshot | null | undefined): boolean {
    const opts = getOptions()
    _restoredSizes.value = restoreCacheMap(snapshot, items.value, simpleArray.value ? null : opts.keyField)
    return Object.keys(_restoredSizes.value).length > 0
  }

  function getRecycledPool(type: unknown): Array<View<TItem, ItemKey<TItem, TKeyField>>> {
    let recycledPool = _recycledPools.get(type)
    if (!recycledPool) {
      recycledPool = []
      _recycledPools.set(type, recycledPool)
    }
    return recycledPool
  }

  function createView(
    viewPool: Array<View<TItem, ItemKey<TItem, TKeyField>>>,
    index: number,
    item: TItem,
    key: ItemKey<TItem, TKeyField>,
    type: unknown,
  ): View<TItem, ItemKey<TItem, TKeyField>> {
    const nr: ViewNonReactive<ItemKey<TItem, TKeyField>> = markRaw({
      id: uid++,
      index,
      used: true,
      key,
      type,
    })
    const view = shallowReactive({
      item,
      position: 0,
      offset: 0,
      nr,
      _vs_styleStamp: 0,
    }) as View<TItem, ItemKey<TItem, TKeyField>>
    viewPool.push(view)
    return view
  }

  function getRecycledView(type: unknown): View<TItem, ItemKey<TItem, TKeyField>> | undefined {
    const recycledPool = getRecycledPool(type)
    if (recycledPool && recycledPool.length) {
      const view = recycledPool.pop()!
      view.nr.used = true
      touchView(view)
      return view
    }
    return undefined
  }

  function removeAndRecycleView(view: View<TItem, ItemKey<TItem, TKeyField>>) {
    const type = view.nr.type
    const recycledPool = getRecycledPool(type)
    recycledPool.push(view)
    view.nr.used = false
    view.position = getOptions().hiddenPosition ?? -999999
    touchView(view)
    _views.delete(view.nr.key)
  }

  function removeAndRecycleAllViews() {
    _views.clear()
    _recycledPools.clear()
    for (let i = 0, l = pool.value.length; i < l; i++) {
      const view = pool.value[i]
      if (view) {
        removeAndRecycleView(view)
      }
    }
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

  function clearPendingTimeouts() {
    if (_updateTimeout) {
      clearTimeout(_updateTimeout)
      _updateTimeout = null
    }
    if (_refreshTimout) {
      clearTimeout(_refreshTimout)
      _refreshTimout = null
    }
    if (_sortTimer) {
      clearTimeout(_sortTimer)
      _sortTimer = null
    }
    if (_shiftAnchorClearTimer) {
      clearTimeout(_shiftAnchorClearTimer)
      _shiftAnchorClearTimer = null
    }
    if (_itemsLimitWarnTimer) {
      clearTimeout(_itemsLimitWarnTimer)
      _itemsLimitWarnTimer = null
    }
  }

  function handleResize() {
    normalizedInputs.callbacks.onResize?.()
    if (ready.value)
      updateVisibleItems(false)
  }

  function handleScroll() {
    if (_shiftAnchor && !_applyingShiftAnchor) {
      clearShiftAnchor()
    }

    const opts = getOptions()
    if (!_scrollDirty) {
      _scrollDirty = true
      if (_updateTimeout)
        return

      const requestUpdate = () => requestFrame(() => {
        _scrollDirty = false
        const { continuous } = updateVisibleItems(false, true)

        // It seems sometimes chrome doesn't fire scroll event :/
        // When non continuous scrolling is ending, we force a refresh
        if (!continuous) {
          if (_refreshTimout)
            clearTimeout(_refreshTimout)
          _refreshTimout = setTimeout(handleScroll, opts.updateInterval + 100)
        }
      })

      requestUpdate()

      // Schedule the next update with throttling
      if (opts.updateInterval) {
        _updateTimeout = setTimeout(() => {
          _updateTimeout = null
          if (_scrollDirty)
            requestUpdate()
        }, opts.updateInterval)
      }
    }
  }

  function handleVisibilityChange(isVisible: boolean, entry: IntersectionObserverEntry) {
    if (ready.value) {
      if (isVisible || entry.boundingClientRect.width !== 0 || entry.boundingClientRect.height !== 0) {
        normalizedInputs.callbacks.onVisible?.()
        requestFrame(() => {
          updateVisibleItems(false)
        })
      }
      else {
        normalizedInputs.callbacks.onHidden?.()
      }
    }
  }

  function getListenerTarget(): Window | Element {
    const elValue = normalizedInputs.el.value
    const target: Element | undefined = elValue ? getScrollParent(elValue) : undefined
    // Fix global scroll target for Chrome and Safari
    if (window.document && (target === window.document.documentElement || target === window.document.body)) {
      return window
    }
    return target || window
  }

  function getLeadingSlotSize(): number {
    const beforeEl = normalizedInputs.before.value
    if (!beforeEl) {
      return 0
    }

    const opts = getOptions()
    return getDirection(opts) === 'vertical'
      ? beforeEl.scrollHeight
      : beforeEl.scrollWidth
  }

  function getScroll(): ScrollState {
    const elValue = normalizedInputs.el.value
    if (!elValue) {
      return { start: 0, end: 0 }
    }
    const opts = getOptions()
    const direction = getDirection(opts)
    const isVertical = direction === 'vertical'
    let scrollState: ScrollState

    if (getPageMode()) {
      const bounds = elValue.getBoundingClientRect()
      const boundsSize = isVertical ? bounds.height : bounds.width
      let start = -(isVertical ? bounds.top : bounds.left)
      let size = isVertical ? window.innerHeight : window.innerWidth
      if (start < 0) {
        size += start
        start = 0
      }
      if (start + size > boundsSize) {
        size = boundsSize - start
      }
      scrollState = {
        start,
        end: start + size,
      }
    }
    else if (isVertical) {
      scrollState = {
        start: elValue.scrollTop,
        end: elValue.scrollTop + elValue.clientHeight,
      }
    }
    else {
      scrollState = {
        start: normalizeOffset(elValue.scrollLeft, direction, elValue),
        end: normalizeOffset(elValue.scrollLeft, direction, elValue) + elValue.clientWidth,
      }
    }

    return scrollState
  }

  function getSecondaryScroll(): ScrollState {
    const elValue = normalizedInputs.el.value
    if (!elValue) {
      return { start: 0, end: 0 }
    }
    const opts = getOptions()

    if (getDirection(opts) === 'vertical') {
      const start = normalizeOffset(elValue.scrollLeft, 'horizontal', elValue)
      return {
        start,
        end: start + elValue.clientWidth,
      }
    }

    return {
      start: elValue.scrollTop,
      end: elValue.scrollTop + elValue.clientHeight,
    }
  }

  /**
   * Detect whether variable-size scroll window crossed previous rendered item boundaries.
   */
  function hasVariableSizeWindowChange(scroll: ScrollState, count: number, sizesValue: Sizes, buffer: number): boolean {
    const leadingSlotSize = getLeadingSlotSize()
    const adjustedStart = scroll.start - buffer - leadingSlotSize
    const adjustedEnd = scroll.end + buffer - leadingSlotSize

    if (_startIndex > 0) {
      const previousStartBoundary = sizesValue[_startIndex - 1]?.accumulator ?? 0
      if (adjustedStart <= previousStartBoundary) {
        return true
      }
    }

    if (_startIndex < count - 1) {
      const nextStartBoundary = sizesValue[_startIndex]?.accumulator ?? Number.POSITIVE_INFINITY
      if (adjustedStart > nextStartBoundary) {
        return true
      }
    }

    if (_endIndex > 1) {
      const previousEndBoundary = sizesValue[_endIndex - 2]?.accumulator ?? 0
      if (adjustedEnd <= previousEndBoundary) {
        return true
      }
    }

    if (_endIndex < count) {
      const nextEndBoundary = sizesValue[_endIndex - 1]?.accumulator ?? Number.POSITIVE_INFINITY
      if (adjustedEnd > nextEndBoundary) {
        return true
      }
    }

    return false
  }

  function getItemSize(index: number): number {
    const opts = getOptions()
    const fixedItemSize = getFixedItemSize(opts.itemSize)
    if (fixedItemSize !== null) {
      return fixedItemSize
    }

    const sizeEntry = (sizes.value as Sizes)[index]
    return sizeEntry?.size || Number(opts.minItemSize) || 0
  }

  /**
   * Build inline styles for a pooled view.
   */
  function getViewStyle(view: View<TItem, ItemKey<TItem, TKeyField>>): CSSProperties {
    const opts = getOptions()
    return getPooledViewStyle(view, {
      direction: getDirection(opts),
      mode: getViewPositionMode(opts),
      itemSize: getFixedItemSize(opts.itemSize),
      gridItems: opts.gridItems,
      itemSecondarySize: opts.itemSecondarySize,
    })
  }

  function getItemOffset(index: number): number {
    const opts = getOptions()
    const gridItems = opts.gridItems || 1
    const fixedItemSize = getFixedItemSize(opts.itemSize)
    if (index <= 0) {
      return 0
    }

    if (fixedItemSize !== null) {
      return Math.floor(index / gridItems) * fixedItemSize
    }

    return ((sizes.value as Sizes)[index - 1]?.accumulator) || 0
  }

  function findItemIndex(offset: number): number {
    const opts = getOptions()
    const count = items.value.length
    const gridItems = opts.gridItems || 1
    const fixedItemSize = getFixedItemSize(opts.itemSize)

    if (!count) {
      return 0
    }

    if (fixedItemSize !== null) {
      const index = Math.floor(offset / fixedItemSize) * gridItems
      return Math.min(Math.max(index, 0), count - 1)
    }

    let low = 0
    let high = count - 1
    let found = 0

    while (low <= high) {
      const mid = Math.floor((low + high) / 2)
      const midOffset = getItemOffset(mid)
      if (midOffset <= offset) {
        found = mid
        low = mid + 1
      }
      else {
        high = mid - 1
      }
    }

    return found
  }

  function clearShiftAnchor() {
    if (_shiftAnchorClearTimer) {
      clearTimeout(_shiftAnchorClearTimer)
      _shiftAnchorClearTimer = null
    }
    _shiftAnchor = null
  }

  function scheduleShiftAnchorClear() {
    if (_shiftAnchorClearTimer) {
      clearTimeout(_shiftAnchorClearTimer)
    }
    _shiftAnchorClearTimer = setTimeout(() => {
      _shiftAnchor = null
      _shiftAnchorClearTimer = null
    }, 150)
  }

  function captureShiftAnchor(previousItems: TItem[], keyField: KeyFieldValue<TItem> | null) {
    if (!previousItems.length) {
      clearShiftAnchor()
      return
    }

    const scrollStart = Math.max(getScroll().start - getLeadingSlotSize(), 0)
    const anchorIndex = Math.min(findItemIndex(scrollStart), previousItems.length - 1)
    const anchorItem = previousItems[anchorIndex]
    const anchorKey = (keyField
      ? resolveItemKey(anchorItem, anchorIndex, keyField) as ItemKey<TItem, TKeyField>
      : anchorIndex as ItemKey<TItem, TKeyField>)

    const anchorStart = getLeadingSlotSize() + getItemOffset(anchorIndex)
    _shiftAnchor = {
      key: anchorKey,
      offset: getScroll().start - anchorStart,
    }
  }

  function applyShiftAnchor(nextItems?: TItem[]): boolean {
    if (!_shiftAnchor) {
      return false
    }

    const opts = getOptions()
    const nextResolvedItems = nextItems ?? items.value
    const keyField = simpleArray.value ? null : opts.keyField
    const keys = getItemKeys(nextResolvedItems, keyField)
    const anchorIndex = keys.indexOf(_shiftAnchor.key)

    if (anchorIndex === -1) {
      clearShiftAnchor()
      return false
    }

    const target = getLeadingSlotSize() + getItemOffset(anchorIndex) + _shiftAnchor.offset
    const current = getScroll().start

    if (Math.abs(target - current) < 0.5) {
      return false
    }

    _applyingShiftAnchor = true
    scrollToPosition(target)
    requestFrame(() => {
      _applyingShiftAnchor = false
    })
    return true
  }

  function addListeners() {
    removeListeners()

    const scrollTarget = getPageMode()
      ? getListenerTarget()
      : normalizedInputs.el.value
    if (!scrollTarget) {
      return
    }

    _scrollListenerTarget = scrollTarget
    _scrollListenerTarget.addEventListener('scroll', handleScroll, supportsPassive()
      ? { passive: true }
      : false)

    if (getPageMode()) {
      _resizeListenerTarget = scrollTarget
      _resizeListenerTarget.addEventListener('resize', handleResize as EventListener)
    }
  }

  function removeListeners() {
    if (_scrollListenerTarget) {
      _scrollListenerTarget.removeEventListener('scroll', handleScroll)
      _scrollListenerTarget = null
    }

    if (_resizeListenerTarget) {
      _resizeListenerTarget.removeEventListener('resize', handleResize as EventListener)
      _resizeListenerTarget = null
    }
  }

  function getGridRenderWindow(
    count: number,
    gridItems: number,
    itemSize: number,
    itemSecondarySize: number,
    primaryScroll: ScrollState,
    secondaryScroll: ScrollState,
  ): GridRenderWindow {
    const totalSize = Math.ceil(count / gridItems) * itemSize
    const primaryStart = Math.max(0, Math.floor(primaryScroll.start / itemSize))
    const primaryEnd = Math.min(Math.ceil(primaryScroll.end / itemSize), Math.ceil(count / gridItems))
    const secondaryStart = Math.max(0, Math.floor(secondaryScroll.start / itemSecondarySize))
    const secondaryEnd = Math.min(Math.ceil(secondaryScroll.end / itemSecondarySize), gridItems)

    const renderedIndices: number[] = []

    for (let primary = primaryStart; primary < primaryEnd; primary++) {
      const groupStart = primary * gridItems
      for (let secondary = secondaryStart; secondary < secondaryEnd; secondary++) {
        const index = groupStart + secondary
        if (index >= count) {
          break
        }
        renderedIndices.push(index)
      }
    }

    const firstIndex = renderedIndices[0] ?? 0
    const lastIndex = renderedIndices.at(-1) ?? -1

    return {
      renderedIndices,
      startIndex: firstIndex,
      endIndex: lastIndex + 1,
      visibleStartIndex: firstIndex,
      visibleEndIndex: lastIndex,
      totalSize,
    }
  }

  function supportsGridSecondaryVirtualization() {
    const opts = getOptions()
    const fixedItemSize = getFixedItemSize(opts.itemSize)
    if (!opts.gridItems || fixedItemSize == null) {
      return false
    }

    const elValue = normalizedInputs.el.value
    if (!elValue) {
      return false
    }

    const itemSecondarySize = opts.itemSecondarySize || fixedItemSize
    const secondaryViewportSize = getDirection(opts) === 'vertical'
      ? elValue.clientWidth
      : elValue.clientHeight

    return itemSecondarySize * opts.gridItems > secondaryViewportSize
  }

  /**
   * Keep a start boundary sticky when only one row toggles near the edge.
   */
  function stabilizeStartBoundary(candidate: number, previous: number, count: number, edge: number): number {
    if (Math.abs(candidate - previous) !== 1 || previous < 0 || previous >= count) {
      return candidate
    }

    const boundary = candidate > previous
      ? getItemOffset(previous) + getItemSize(previous)
      : getItemOffset(previous)

    return Math.abs(boundary - edge) <= FLOW_IDLE_HYSTERESIS_PX
      ? previous
      : candidate
  }

  /**
   * Keep an end boundary sticky under the same one-row oscillation rule.
   */
  function stabilizeEndBoundary(
    candidate: number,
    previous: number,
    count: number,
    edge: number,
    exclusive: boolean,
  ): number {
    if (Math.abs(candidate - previous) !== 1) {
      return candidate
    }

    const boundaryIndex = exclusive ? previous - 1 : previous
    if (boundaryIndex < 0 || boundaryIndex >= count) {
      return candidate
    }

    const boundary = candidate > previous
      ? getItemOffset(boundaryIndex) + getItemSize(boundaryIndex)
      : getItemOffset(boundaryIndex)

    return Math.abs(boundary - edge) <= FLOW_IDLE_HYSTERESIS_PX
      ? previous
      : candidate
  }

  /**
   * Stabilize idle flow-mode variable-size windows against tiny layout churn.
   */
  function stabilizeFlowWindow(nextRange: RenderWindowRange, count: number, edges: FlowWindowEdges): RenderWindowRange {
    const stabilizedRange: RenderWindowRange = {
      ...nextRange,
      visibleStartIndex: stabilizeStartBoundary(nextRange.visibleStartIndex, _visibleStartIndex, count, edges.rawViewportStart),
      visibleEndIndex: stabilizeEndBoundary(nextRange.visibleEndIndex, _visibleEndIndex, count, edges.rawViewportEnd, false),
      startIndex: stabilizeStartBoundary(nextRange.startIndex, _startIndex, count, edges.renderStart),
      endIndex: stabilizeEndBoundary(nextRange.endIndex, _endIndex, count, edges.renderEnd, true),
    }

    if (stabilizedRange.startIndex > stabilizedRange.visibleStartIndex) {
      stabilizedRange.startIndex = stabilizedRange.visibleStartIndex
    }

    const minimumEndIndex = Math.min(count, stabilizedRange.visibleEndIndex + 1)
    if (stabilizedRange.endIndex < minimumEndIndex) {
      stabilizedRange.endIndex = minimumEndIndex
    }

    if (stabilizedRange.endIndex < stabilizedRange.startIndex) {
      stabilizedRange.endIndex = stabilizedRange.startIndex
    }

    return stabilizedRange
  }

  function updateVisibleItems(itemsChanged: boolean, checkPositionDiff = false): { continuous: boolean } {
    const opts = getOptions()
    const itemSize = getFixedItemSize(opts.itemSize)
    const gridItems = opts.gridItems || 1
    const itemSecondarySize = opts.itemSecondarySize || itemSize || 0
    const minItemSize = _computedMinItemSize
    const typeField = opts.typeField
    const keyField = simpleArray.value ? null : opts.keyField
    const currentItems = items.value
    const count = currentItems.length
    const sizesValue = sizes.value as Sizes
    const views = _views
    const poolValue = pool.value
    let renderedIndices: number[] | null = null
    let renderedIndexSet: Set<number> | null = null
    let startIndex: number, endIndex: number
    let totalSizeValue: number
    let visibleStartIndex: number, visibleEndIndex: number

    if (!count) {
      startIndex = endIndex = visibleStartIndex = visibleEndIndex = totalSizeValue = 0
    }
    else if (_prerender) {
      startIndex = visibleStartIndex = 0
      endIndex = visibleEndIndex = Math.min(opts.prerender, currentItems.length)
      totalSizeValue = 0
    }
    else {
      const rawScroll = getScroll()
      const rawSecondaryScroll = getSecondaryScroll()
      const previousScrollPosition = _lastUpdateScrollPosition
      const previousSecondaryScrollPosition = _lastUpdateSecondaryScrollPosition
      const scroll = { ...rawScroll }
      const secondaryScroll = { ...rawSecondaryScroll }

      // Skip update if user hasn't scrolled enough
      if (checkPositionDiff) {
        let positionDiff = rawScroll.start - previousScrollPosition
        if (positionDiff < 0)
          positionDiff = -positionDiff

        let secondaryPositionDiff = rawSecondaryScroll.start - previousSecondaryScrollPosition
        if (secondaryPositionDiff < 0)
          secondaryPositionDiff = -secondaryPositionDiff

        const variableSizeWindowChanged = itemSize === null
          && hasVariableSizeWindowChange(rawScroll, count, sizesValue, opts.buffer)
        const primaryThresholdMet = (itemSize === null && (positionDiff >= minItemSize || variableSizeWindowChanged))
          || (itemSize !== null && positionDiff >= itemSize)
        const secondaryThresholdMet = gridItems > 1
          && itemSize != null
          && secondaryPositionDiff >= itemSecondarySize

        if (!primaryThresholdMet && !secondaryThresholdMet) {
          return {
            continuous: true,
          }
        }
      }
      _lastUpdateScrollPosition = rawScroll.start
      _lastUpdateSecondaryScrollPosition = rawSecondaryScroll.start

      const buffer = opts.buffer
      scroll.start -= buffer
      scroll.end += buffer
      secondaryScroll.start -= buffer
      secondaryScroll.end += buffer

      // account for leading slot
      let beforeSize = 0
      const beforeEl = normalizedInputs.before.value
      if (beforeEl) {
        beforeSize = beforeEl.scrollHeight
        scroll.start -= beforeSize
      }

      // account for trailing slot
      const afterEl = normalizedInputs.after.value
      if (afterEl) {
        const afterSize = afterEl.scrollHeight
        scroll.end += afterSize
      }

      const shouldStabilizeIdleFlowWindow = getViewPositionMode(opts) === 'flow'
        && itemSize === null
        && !checkPositionDiff
        && _hasWindowState
        && Math.abs(rawScroll.start - previousScrollPosition) <= FLOW_IDLE_SCROLL_EPSILON_PX
        && Math.abs(rawSecondaryScroll.start - previousSecondaryScrollPosition) <= FLOW_IDLE_SCROLL_EPSILON_PX

      // Variable size mode
      if (itemSize === null) {
        let h: number
        let a = 0
        let b = count - 1
        let i = ~~(count / 2)
        let oldI: number

        // Searching for startIndex
        do {
          oldI = i
          h = sizesValue[i].accumulator
          if (h < scroll.start) {
            a = i
          }
          else if (i < count - 1 && sizesValue[i + 1].accumulator > scroll.start) {
            b = i
          }
          i = ~~((a + b) / 2)
        } while (i !== oldI)
        if (i < 0)
          i = 0
        startIndex = i

        // For container style
        totalSizeValue = sizesValue[count - 1].accumulator

        // Searching for endIndex
        for (endIndex = i; endIndex < count && sizesValue[endIndex].accumulator < scroll.end; endIndex++);
        if (endIndex === -1) {
          endIndex = currentItems.length - 1
        }
        else {
          endIndex++
          // Bounds
          if (endIndex > count)
            endIndex = count
        }

        // search visible startIndex
        for (visibleStartIndex = startIndex; visibleStartIndex < count && (beforeSize + sizesValue[visibleStartIndex].accumulator) < scroll.start; visibleStartIndex++);

        // search visible endIndex
        for (visibleEndIndex = visibleStartIndex; visibleEndIndex < count && (beforeSize + sizesValue[visibleEndIndex].accumulator) < scroll.end; visibleEndIndex++);

        if (shouldStabilizeIdleFlowWindow) {
          const stabilizedRange = stabilizeFlowWindow({
            startIndex,
            endIndex,
            visibleStartIndex,
            visibleEndIndex,
          }, count, {
            rawViewportStart: rawScroll.start - beforeSize,
            rawViewportEnd: rawScroll.end - beforeSize,
            renderStart: rawScroll.start - buffer - beforeSize,
            renderEnd: rawScroll.end + buffer - beforeSize,
          })

          startIndex = stabilizedRange.startIndex
          endIndex = stabilizedRange.endIndex
          visibleStartIndex = stabilizedRange.visibleStartIndex
          visibleEndIndex = stabilizedRange.visibleEndIndex
        }
      }
      else {
        // Fixed size mode
        if (gridItems > 1) {
          const gridWindow = getGridRenderWindow(
            count,
            gridItems,
            itemSize,
            itemSecondarySize,
            scroll,
            secondaryScroll,
          )

          renderedIndices = gridWindow.renderedIndices
          renderedIndexSet = new Set(renderedIndices)
          startIndex = gridWindow.startIndex
          endIndex = gridWindow.endIndex
          visibleStartIndex = gridWindow.visibleStartIndex
          visibleEndIndex = gridWindow.visibleEndIndex
          totalSizeValue = gridWindow.totalSize
        }
        else {
          startIndex = ~~(scroll.start / itemSize * gridItems)
          const remainer = startIndex % gridItems
          startIndex -= remainer
          endIndex = Math.ceil(scroll.end / itemSize * gridItems)
          visibleStartIndex = Math.max(0, Math.floor((scroll.start - beforeSize) / itemSize * gridItems))
          visibleEndIndex = Math.floor((scroll.end - beforeSize) / itemSize * gridItems)

          // Bounds
          if (startIndex < 0)
            startIndex = 0
          if (endIndex > count)
            endIndex = count
          if (visibleStartIndex < 0)
            visibleStartIndex = 0
          if (visibleEndIndex > count)
            visibleEndIndex = count

          totalSizeValue = Math.ceil(count / gridItems) * itemSize
        }
      }
    }

    if (endIndex - startIndex > config.itemsLimit) {
      itemsLimitError()
    }

    totalSize.value = totalSizeValue
    startSpacerSize.value = 0
    endSpacerSize.value = getViewPositionMode(opts) === 'flow' ? totalSizeValue : 0

    let view: View<TItem, ItemKey<TItem, TKeyField>> | undefined

    const continuous = startIndex <= _endIndex && endIndex >= _startIndex

    // Step 1: Mark any invisible elements as unused
    if (!continuous || itemsChanged) {
      removeAndRecycleAllViews()
    }
    else {
      for (let i = 0, l = poolValue.length; i < l; i++) {
        const currentView = poolValue[i]
        if (!currentView) {
          continue
        }
        view = currentView
        if (view.nr.used) {
          const viewVisible = renderedIndexSet
            ? renderedIndexSet.has(view.nr.index)
            : (view.nr.index >= startIndex && view.nr.index < endIndex)
          const viewSize = itemSize || (sizesValue[view.nr.index] && sizesValue[view.nr.index].size)
          if (!viewVisible || !viewSize) {
            removeAndRecycleView(view)
          }
        }
      }
    }

    // Step 2: Assign a view and update props for every view that became visible
    let item: TItem, type: unknown
    let firstVisiblePosition: number | null = null
    let renderedVisibleSize = 0
    const indices = renderedIndices ?? Array.from({ length: Math.max(0, endIndex - startIndex) }, (_, index) => startIndex + index)
    for (const i of indices) {
      const elementSize = itemSize || (sizesValue[i] && sizesValue[i].size)
      if (!elementSize)
        continue
      item = currentItems[i]
      const key = (keyField ? resolveItemKey(item, i, keyField) : i) as ItemKey<TItem, TKeyField>
      view = views.get(key)

      if (!view) {
        // Item just became visible
        type = (item as any)[typeField]
        view = getRecycledView(type)

        if (view) {
          const viewStateChanged = view.nr.index !== i || view.nr.key !== key
          view.item = item
          view.nr.index = i
          view.nr.key = key
          if (view.nr.type !== type) {
            console.warn('Reused view\'s type does not match pool\'s type')
          }
          if (viewStateChanged) {
            touchView(view)
          }
        }
        else {
          // No recycled view available, create a new one
          view = createView(poolValue, i, item, key, type)
        }
        views.set(key, view)
      }
      else {
        if (view.item !== item) {
          view.item = item
        }
        if (!view.nr.used) {
          console.warn(`Expected existing view's used flag to be true, got ${view.nr.used}`)
        }
      }

      // Update position
      if (itemSize === null) {
        view.position = sizesValue[i - 1]?.accumulator || 0
        view.offset = 0
      }
      else {
        view.position = Math.floor(i / gridItems) * itemSize
        view.offset = (i % gridItems) * itemSecondarySize
      }

      firstVisiblePosition ??= view.position
      renderedVisibleSize += elementSize
    }

    if (getViewPositionMode(opts) === 'flow') {
      if (firstVisiblePosition == null) {
        startSpacerSize.value = 0
        endSpacerSize.value = totalSizeValue
      }
      else {
        startSpacerSize.value = firstVisiblePosition
        endSpacerSize.value = Math.max(0, totalSizeValue - firstVisiblePosition - renderedVisibleSize)
      }
      sortFlowModePool()
    }
    else {
      startSpacerSize.value = 0
      endSpacerSize.value = 0
    }

    _startIndex = startIndex
    _endIndex = endIndex
    _visibleStartIndex = visibleStartIndex
    _visibleEndIndex = visibleEndIndex
    _hasWindowState = true
    if (opts.emitUpdate)
      normalizedInputs.callbacks.onUpdate?.(startIndex, endIndex, visibleStartIndex, visibleEndIndex)

    // After the user has finished scrolling
    // Sort views so text selection is correct
    if (getViewPositionMode(opts) !== 'flow') {
      if (_sortTimer)
        clearTimeout(_sortTimer)
      _sortTimer = setTimeout(sortViews, opts.updateInterval + 300)
    }

    return {
      continuous,
    }
  }

  function itemsLimitError() {
    _itemsLimitWarnTimer = setTimeout(() => {
      _itemsLimitWarnTimer = null
      console.warn('It seems the scroller element isn\'t scrolling, so it tries to render all the items at once.', 'Scroller:', normalizedInputs.el.value)
      console.warn('Make sure the scroller has a fixed height (or width) and \'overflow-y\' (or \'overflow-x\') set to \'auto\' so it can scroll correctly and only render the items visible in the scroll viewport.')
    })
    throw new Error('Rendered items limit reached')
  }

  function hasVisibleViewGap(): boolean {
    if (supportsGridSecondaryVirtualization()) {
      return false
    }

    const visibleViews = pool.value.filter(({ nr }) => nr.used)
    for (let i = 1; i < visibleViews.length; i++) {
      if (visibleViews[i].nr.index !== visibleViews[i - 1].nr.index + 1) {
        return true
      }
    }
    return false
  }

  function sortViews() {
    if (getViewPositionMode() === 'flow') {
      sortFlowModePool()
      return
    }

    pool.value.sort((viewA, viewB) => viewA.nr.index - viewB.nr.index)

    if (hasVisibleViewGap()) {
      updateVisibleItems(false)
      if (_sortTimer)
        clearTimeout(_sortTimer)
    }
  }

  function scrollToItem(index: number, scrollOptions?: ScrollToOptions) {
    const opts = getOptions()
    const direction = getDirection(opts)
    const elValue = normalizedInputs.el.value
    if (!elValue) {
      return
    }
    const targetIndex = Math.max(0, Math.min(index, items.value.length - 1))
    const viewportStart = getScroll().start
    const viewportSize = getViewportSize(elValue, direction, opts.pageMode)
    const itemStart = getItemOffset(targetIndex)
    const itemSize = getItemSize(targetIndex)
    const target = getAlignedScrollOffset(
      itemStart,
      itemSize,
      viewportStart,
      viewportSize,
      scrollOptions?.align,
      scrollOptions?.offset ?? 0,
    )

    if (target == null) {
      return
    }

    scrollToPosition(target, scrollOptions)

    const fixedItemSize = getFixedItemSize(opts.itemSize)
    if (opts.gridItems && fixedItemSize != null) {
      const elValue = normalizedInputs.el.value
      if (!elValue) {
        return
      }
      const gridItems = opts.gridItems
      const itemSecondarySize = opts.itemSecondarySize || fixedItemSize
      const secondaryIndex = targetIndex % gridItems
      const secondaryItemStart = secondaryIndex * itemSecondarySize
      const secondaryDirection = direction === 'vertical' ? 'horizontal' : 'vertical'
      const secondaryViewportStart = secondaryDirection === 'horizontal'
        ? normalizeOffset(elValue.scrollLeft, 'horizontal', elValue)
        : elValue.scrollTop
      const secondaryViewportSize = secondaryDirection === 'horizontal'
        ? elValue.clientWidth
        : elValue.clientHeight
      const secondaryTarget = getAlignedScrollOffset(
        secondaryItemStart,
        itemSecondarySize,
        secondaryViewportStart,
        secondaryViewportSize,
        scrollOptions?.align,
        scrollOptions?.offset ?? 0,
      )

      if (secondaryTarget != null) {
        scrollElementTo(elValue, secondaryDirection, secondaryTarget, scrollOptions)
      }
    }
  }

  function scrollToPosition(position: number, scrollOptions?: ScrollToOptions) {
    const opts = getOptions()
    const direction = getDirection(opts)
    const elValue = normalizedInputs.el.value
    if (!elValue) {
      return
    }

    if (getPageMode()) {
      const viewportEl = getScrollParent(elValue) as HTMLElement
      const bounds = viewportEl.getBoundingClientRect()
      const scroller = elValue.getBoundingClientRect()
      const startProp = direction === 'vertical' ? 'top' : 'left'
      const currentScroll = getScrollParent(elValue) === document.documentElement || getScrollParent(elValue) === document.body
        ? (direction === 'vertical' ? window.scrollY : window.scrollX)
        : normalizeOffset(
            direction === 'vertical'
              ? (viewportEl as any).scrollTop
              : (viewportEl as any).scrollLeft,
            direction,
            viewportEl,
          )
      const scrollerPosition = (scroller as any)[startProp] - (bounds as any)[startProp]
      scrollElementTo(viewportEl.tagName === 'HTML' ? window : viewportEl, direction, position + currentScroll + scrollerPosition, scrollOptions)
    }
    else {
      scrollElementTo(elValue, direction, position, scrollOptions)
    }
  }

  // In SSR mode, we also prerender the same number of item for the first render
  const initialOpts = getOptions()
  const initialItems = items.value
  _previousKeys = getItemKeys(initialItems, initialItems.length > 0 && typeof initialItems[0] !== 'object' ? null : initialOpts.keyField) as Array<ItemKey<TItem, TKeyField>>
  if (initialOpts.cache) {
    restoreCache(initialOpts.cache)
  }
  if (initialOpts.prerender) {
    _prerender = true
    updateVisibleItems(false)
  }

  if (initialOpts.gridItems && getFixedItemSize(initialOpts.itemSize) == null) {
    console.error('[vue-recycle-scroller] You must provide an itemSize when using gridItems')
  }

  onMounted(() => {
    addListeners()
    nextTick(() => {
      // In SSR mode, render the number of visible items
      _prerender = false
      updateVisibleItems(true)
      ready.value = true
    })
  })

  onActivated(() => {
    const lastPosition = _lastUpdateScrollPosition
    if (typeof lastPosition === 'number') {
      nextTick(() => {
        scrollToPosition(lastPosition)
      })
    }
  })

  onBeforeUnmount(() => {
    clearPendingTimeouts()
    cancelPendingFrames()
    removeListeners()
  })

  // Watchers
  watch(() => getOptions().cache, (snapshot) => {
    restoreCache(snapshot)
    updateVisibleItems(true)
  })

  watch(items, (nextItems, previousItems) => {
    const opts = getOptions()
    const keyField = simpleArray.value ? null : opts.keyField
    const nextKeys = getItemKeys(nextItems, keyField)

    if (opts.shift) {
      const previousKeys = previousItems
        ? getItemKeys(previousItems, keyField) as Array<ItemKey<TItem, TKeyField>>
        : _previousKeys
      const prependOffset = findPrependOffset(previousKeys, nextKeys as Array<ItemKey<TItem, TKeyField>>)
      if (prependOffset > 0) {
        captureShiftAnchor(previousItems ?? [], keyField)
      }
      else {
        clearShiftAnchor()
      }
    }
    else {
      clearShiftAnchor()
    }

    _previousKeys = nextKeys as Array<ItemKey<TItem, TKeyField>>
    applyShiftAnchor(nextItems)
    updateVisibleItems(true)
  })

  watch(() => getOptions().keyField, () => {
    const opts = getOptions()
    const keyField = simpleArray.value ? null : opts.keyField
    _previousKeys = getItemKeys(items.value, keyField) as Array<ItemKey<TItem, TKeyField>>
    clearShiftAnchor()
    updateVisibleItems(true)
  })

  watch(getPageMode, () => {
    removeListeners()
    addListeners()
    updateVisibleItems(false)
  })

  watch(normalizedInputs.el, () => {
    removeListeners()
    addListeners()
    updateVisibleItems(false)
  })

  watch(sizes, () => {
    if (applyShiftAnchor()) {
      scheduleShiftAnchorClear()
    }
    updateVisibleItems(false)
  }, { deep: true })

  watch(() => getOptions().gridItems, () => {
    updateVisibleItems(true)
  })

  watch(() => getOptions().itemSecondarySize, () => {
    updateVisibleItems(true)
  })

  return {
    pool,
    visiblePool,
    totalSize,
    startSpacerSize,
    endSpacerSize,
    ready,
    sizes,
    simpleArray,
    scrollToItem,
    scrollToPosition,
    getScroll,
    findItemIndex,
    getItemOffset,
    getItemSize,
    getViewStyle,
    cacheSnapshot,
    restoreCache,
    updateVisibleItems,
    handleResize,
    handleVisibilityChange,
    sortViews,
  }
}

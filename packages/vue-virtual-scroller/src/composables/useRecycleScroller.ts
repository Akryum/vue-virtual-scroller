import type { ComputedRef, MaybeRef, MaybeRefOrGetter, Ref } from 'vue'
import type { CacheSnapshot, ItemKey, ScrollDirection, ScrollState, ScrollToOptions, Sizes, ValidKeyField, ValidSizeField, View, ViewNonReactive } from '../types'
import { computed, markRaw, nextTick, onActivated, onBeforeUnmount, onMounted, ref, shallowReactive, toValue, watch } from 'vue'
import config from '../config'
import { buildCacheSnapshot, findPrependOffset, getAlignedScrollOffset, getItemKeys, restoreCacheMap } from '../engine/cache'
import { getViewportSize, normalizeOffset, scrollElementTo } from '../engine/scroll'
import { getScrollParent } from '../scrollparent'
import { supportsPassive } from '../utils'

export interface UseRecycleScrollerOptions<TItem = unknown, TKeyField extends string = 'id', TSizeField extends string = 'size'> {
  items: TItem[]
  keyField: ValidKeyField<TItem, TKeyField>
  direction: ScrollDirection
  itemSize: number | null
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
  updateInterval: number
}

export interface UseRecycleScrollerReturn<TItem = unknown, TKey = ItemKey<TItem>> {
  pool: Ref<Array<View<TItem, TKey>>>
  visiblePool: ComputedRef<Array<View<TItem, TKey>>>
  totalSize: Ref<number>
  ready: Ref<boolean>
  sizes: ComputedRef<Sizes | never[]>
  simpleArray: ComputedRef<boolean>
  scrollToItem: (index: number, options?: ScrollToOptions) => void
  scrollToPosition: (position: number, options?: ScrollToOptions) => void
  getScroll: () => ScrollState
  findItemIndex: (offset: number) => number
  getItemOffset: (index: number) => number
  getItemSize: (index: number) => number
  cacheSnapshot: ComputedRef<CacheSnapshot>
  restoreCache: (snapshot: CacheSnapshot | null | undefined) => boolean
  updateVisibleItems: (itemsChanged: boolean, checkPositionDiff?: boolean) => { continuous: boolean }
  handleScroll: () => void
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

function getItemKeyValue<TItem, TKeyField extends string>(
  item: TItem,
  index: number,
  keyField: ValidKeyField<TItem, TKeyField>,
): ItemKey<TItem, TKeyField> {
  const key = (item as any)?.[keyField]
  if (key == null) {
    throw new Error(`Key is ${key} on item (keyField is '${keyField}')`)
  }
  return key as ItemKey<TItem, TKeyField>
}

interface GridRenderWindow {
  renderedIndices: number[]
  startIndex: number
  endIndex: number
  visibleStartIndex: number
  visibleEndIndex: number
  totalSize: number
}

export function useRecycleScroller<TItem, TKeyField extends string = 'id', TSizeField extends string = 'size'>(
  options: MaybeRefOrGetter<UseRecycleScrollerOptions<TItem, TKeyField, TSizeField>>,
  el: MaybeRef<HTMLElement | undefined>,
  before?: MaybeRef<HTMLElement | undefined>,
  after?: MaybeRef<HTMLElement | undefined>,
  callbacks?: {
    onResize?: () => void
    onVisible?: () => void
    onHidden?: () => void
    onUpdate?: (startIndex: number, endIndex: number, visibleStartIndex: number, visibleEndIndex: number) => void
  },
): UseRecycleScrollerReturn<TItem, ItemKey<TItem, TKeyField>> {
  // Reactive state
  const pool = ref<Array<View<TItem, ItemKey<TItem, TKeyField>>>>([]) as Ref<Array<View<TItem, ItemKey<TItem, TKeyField>>>>
  const totalSize = ref(0)
  const ready = ref(false)

  // Internal state (non-reactive)
  let _startIndex = 0
  let _endIndex = 0
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
  let _listenerTarget: (Window | Element) | null = null
  let _previousKeys: Array<ItemKey<TItem, TKeyField>> = []
  let _shiftAnchor: { key: ItemKey<TItem, TKeyField>, offset: number } | null = null
  let _shiftAnchorClearTimer: ReturnType<typeof setTimeout> | null = null
  let _itemsLimitWarnTimer: ReturnType<typeof setTimeout> | null = null
  let _applyingShiftAnchor = false
  const _rafIds = new Set<number>()
  const _restoredSizes = ref<Record<ItemKey<TItem, TKeyField>, number>>({} as Record<ItemKey<TItem, TKeyField>, number>)

  // Computed
  const simpleArray = computed(() => {
    const opts = toValue(options)
    return opts.items.length > 0 && typeof opts.items[0] !== 'object'
  })

  const sizes = computed<Sizes | never[]>(() => {
    const opts = toValue(options)
    if (opts.itemSize === null) {
      const sizes: Sizes = {
        [-1]: { accumulator: 0 },
      }
      const items = opts.items
      const field = opts.sizeField ?? 'size'
      const minItemSize = opts.minItemSize as number
      const restoredSizes = _restoredSizes.value
      let computedMinSize = 10000
      let accumulator = 0
      let current: number
      for (let i = 0, l = items.length; i < l; i++) {
        const key = simpleArray.value ? i : getItemKeyValue(items[i], i, opts.keyField)
        current = restoredSizes[key] || (items[i] as any)[field] || minItemSize
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
    const opts = toValue(options)
    const keyField = simpleArray.value ? null : opts.keyField
    return buildCacheSnapshot(opts.items, keyField, (item, index, key) => {
      if (opts.itemSize != null) {
        return opts.itemSize
      }

      return _restoredSizes.value[key as ItemKey<TItem, TKeyField>] || (item as any)?.[opts.sizeField ?? 'size'] || undefined
    })
  })

  // Methods
  function restoreCache(snapshot: CacheSnapshot | null | undefined): boolean {
    const opts = toValue(options)
    _restoredSizes.value = restoreCacheMap(snapshot, opts.items, simpleArray.value ? null : opts.keyField)
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
    view.position = -9999
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
    callbacks?.onResize?.()
    if (ready.value)
      updateVisibleItems(false)
  }

  function handleScroll() {
    if (_shiftAnchor && !_applyingShiftAnchor) {
      clearShiftAnchor()
    }

    const opts = toValue(options)
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
        callbacks?.onVisible?.()
        requestFrame(() => {
          updateVisibleItems(false)
        })
      }
      else {
        callbacks?.onHidden?.()
      }
    }
  }

  function getListenerTarget(): Window | Element {
    const elValue = toValue(el)
    const target: Element | undefined = elValue ? getScrollParent(elValue) : undefined
    // Fix global scroll target for Chrome and Safari
    if (window.document && (target === window.document.documentElement || target === window.document.body)) {
      return window
    }
    return target || window
  }

  function getLeadingSlotSize(): number {
    const beforeEl = toValue(before)
    if (!beforeEl) {
      return 0
    }

    const opts = toValue(options)
    return opts.direction === 'vertical'
      ? beforeEl.scrollHeight
      : beforeEl.scrollWidth
  }

  function getScroll(): ScrollState {
    const elValue = toValue(el)
    if (!elValue) {
      return { start: 0, end: 0 }
    }
    const opts = toValue(options)
    const isVertical = opts.direction === 'vertical'
    let scrollState: ScrollState

    if (opts.pageMode) {
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
        start: normalizeOffset(elValue.scrollLeft, opts.direction, elValue),
        end: normalizeOffset(elValue.scrollLeft, opts.direction, elValue) + elValue.clientWidth,
      }
    }

    return scrollState
  }

  function getSecondaryScroll(): ScrollState {
    const elValue = toValue(el)
    if (!elValue) {
      return { start: 0, end: 0 }
    }
    const opts = toValue(options)

    if (opts.direction === 'vertical') {
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

  function getItemSize(index: number): number {
    const opts = toValue(options)
    if (opts.itemSize != null) {
      return opts.itemSize
    }

    const sizeEntry = (sizes.value as Sizes)[index]
    return sizeEntry?.size || Number(opts.minItemSize) || 0
  }

  function getItemOffset(index: number): number {
    const opts = toValue(options)
    const gridItems = opts.gridItems || 1
    if (index <= 0) {
      return 0
    }

    if (opts.itemSize != null) {
      return Math.floor(index / gridItems) * opts.itemSize
    }

    return ((sizes.value as Sizes)[index - 1]?.accumulator) || 0
  }

  function findItemIndex(offset: number): number {
    const opts = toValue(options)
    const count = opts.items.length
    const gridItems = opts.gridItems || 1

    if (!count) {
      return 0
    }

    if (opts.itemSize != null) {
      const index = Math.floor(offset / opts.itemSize) * gridItems
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

  function captureShiftAnchor(previousItems: TItem[], keyField: ValidKeyField<TItem, TKeyField> | null) {
    if (!previousItems.length) {
      clearShiftAnchor()
      return
    }

    const scrollStart = Math.max(getScroll().start - getLeadingSlotSize(), 0)
    const anchorIndex = Math.min(findItemIndex(scrollStart), previousItems.length - 1)
    const anchorItem = previousItems[anchorIndex]
    const anchorKey = keyField
      ? (anchorItem as any)?.[keyField]
      : anchorIndex

    if (anchorKey == null) {
      clearShiftAnchor()
      return
    }

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

    const opts = toValue(options)
    const items = nextItems ?? opts.items
    const keyField = simpleArray.value ? null : opts.keyField
    const keys = getItemKeys(items, keyField)
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

  function applyPageMode() {
    const opts = toValue(options)
    if (opts.pageMode) {
      addListeners()
    }
    else {
      removeListeners()
    }
  }

  function addListeners() {
    _listenerTarget = getListenerTarget()
    _listenerTarget.addEventListener('scroll', handleScroll, supportsPassive()
      ? { passive: true }
      : false)
    _listenerTarget.addEventListener('resize', handleResize as EventListener)
  }

  function removeListeners() {
    if (!_listenerTarget) {
      return
    }

    _listenerTarget.removeEventListener('scroll', handleScroll)
    _listenerTarget.removeEventListener('resize', handleResize as EventListener)

    _listenerTarget = null
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
    const opts = toValue(options)
    if (!opts.gridItems || opts.itemSize == null) {
      return false
    }

    const elValue = toValue(el)
    if (!elValue) {
      return false
    }

    const itemSecondarySize = opts.itemSecondarySize || opts.itemSize
    const secondaryViewportSize = opts.direction === 'vertical'
      ? elValue.clientWidth
      : elValue.clientHeight

    return itemSecondarySize * opts.gridItems > secondaryViewportSize
  }

  function updateVisibleItems(itemsChanged: boolean, checkPositionDiff = false): { continuous: boolean } {
    const opts = toValue(options)
    const itemSize = opts.itemSize
    const gridItems = opts.gridItems || 1
    const itemSecondarySize = opts.itemSecondarySize || (itemSize as number)
    const minItemSize = _computedMinItemSize
    const typeField = opts.typeField
    const keyField = simpleArray.value ? null : opts.keyField
    const items = opts.items
    const count = items.length
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
      endIndex = visibleEndIndex = Math.min(opts.prerender, items.length)
      totalSizeValue = 0
    }
    else {
      const scroll = getScroll()
      const secondaryScroll = getSecondaryScroll()

      // Skip update if user hasn't scrolled enough
      if (checkPositionDiff) {
        let positionDiff = scroll.start - _lastUpdateScrollPosition
        if (positionDiff < 0)
          positionDiff = -positionDiff

        let secondaryPositionDiff = secondaryScroll.start - _lastUpdateSecondaryScrollPosition
        if (secondaryPositionDiff < 0)
          secondaryPositionDiff = -secondaryPositionDiff

        const primaryThresholdMet = (itemSize === null && positionDiff >= minItemSize)
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
      _lastUpdateScrollPosition = scroll.start
      _lastUpdateSecondaryScrollPosition = secondaryScroll.start

      const buffer = opts.buffer
      scroll.start -= buffer
      scroll.end += buffer
      secondaryScroll.start -= buffer
      secondaryScroll.end += buffer

      // account for leading slot
      let beforeSize = 0
      const beforeEl = toValue(before)
      if (beforeEl) {
        beforeSize = beforeEl.scrollHeight
        scroll.start -= beforeSize
      }

      // account for trailing slot
      const afterEl = toValue(after)
      if (afterEl) {
        const afterSize = afterEl.scrollHeight
        scroll.end += afterSize
      }

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
          endIndex = items.length - 1
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
    const indices = renderedIndices ?? Array.from({ length: Math.max(0, endIndex - startIndex) }, (_, index) => startIndex + index)
    for (const i of indices) {
      const elementSize = itemSize || (sizesValue[i] && sizesValue[i].size)
      if (!elementSize)
        continue
      item = items[i]
      const key = (keyField ? (item as any)[keyField] : i) as ItemKey<TItem, TKeyField>
      if (key == null) {
        throw new Error(`Key is ${key} on item (keyField is '${keyField}')`)
      }
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
    }

    _startIndex = startIndex
    _endIndex = endIndex
    if (opts.emitUpdate)
      callbacks?.onUpdate?.(startIndex, endIndex, visibleStartIndex, visibleEndIndex)

    // After the user has finished scrolling
    // Sort views so text selection is correct
    if (_sortTimer)
      clearTimeout(_sortTimer)
    _sortTimer = setTimeout(sortViews, opts.updateInterval + 300)

    return {
      continuous,
    }
  }

  function itemsLimitError() {
    _itemsLimitWarnTimer = setTimeout(() => {
      _itemsLimitWarnTimer = null
      console.warn('It seems the scroller element isn\'t scrolling, so it tries to render all the items at once.', 'Scroller:', toValue(el))
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
    pool.value.sort((viewA, viewB) => viewA.nr.index - viewB.nr.index)

    if (hasVisibleViewGap()) {
      updateVisibleItems(false)
      if (_sortTimer)
        clearTimeout(_sortTimer)
    }
  }

  function scrollToItem(index: number, scrollOptions?: ScrollToOptions) {
    const opts = toValue(options)
    const elValue = toValue(el)
    if (!elValue) {
      return
    }
    const targetIndex = Math.max(0, Math.min(index, opts.items.length - 1))
    const viewportStart = getScroll().start
    const viewportSize = getViewportSize(elValue, opts.direction, opts.pageMode)
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

    if (opts.gridItems && opts.itemSize != null) {
      const elValue = toValue(el)
      if (!elValue) {
        return
      }
      const gridItems = opts.gridItems
      const itemSecondarySize = opts.itemSecondarySize || opts.itemSize
      const secondaryIndex = targetIndex % gridItems
      const secondaryItemStart = secondaryIndex * itemSecondarySize
      const secondaryDirection = opts.direction === 'vertical' ? 'horizontal' : 'vertical'
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
    const opts = toValue(options)
    const elValue = toValue(el)
    if (!elValue) {
      return
    }

    if (opts.pageMode) {
      const viewportEl = getScrollParent(elValue) as HTMLElement
      const bounds = viewportEl.getBoundingClientRect()
      const scroller = elValue.getBoundingClientRect()
      const startProp = opts.direction === 'vertical' ? 'top' : 'left'
      const currentScroll = getScrollParent(elValue) === document.documentElement || getScrollParent(elValue) === document.body
        ? (opts.direction === 'vertical' ? window.scrollY : window.scrollX)
        : normalizeOffset(
            opts.direction === 'vertical'
              ? (viewportEl as any).scrollTop
              : (viewportEl as any).scrollLeft,
            opts.direction,
            viewportEl,
          )
      const scrollerPosition = (scroller as any)[startProp] - (bounds as any)[startProp]
      scrollElementTo(viewportEl.tagName === 'HTML' ? window : viewportEl, opts.direction, position + currentScroll + scrollerPosition, scrollOptions)
    }
    else {
      scrollElementTo(elValue, opts.direction, position, scrollOptions)
    }
  }

  // In SSR mode, we also prerender the same number of item for the first render
  const initialOpts = toValue(options)
  _previousKeys = getItemKeys(initialOpts.items, initialOpts.items.length > 0 && typeof initialOpts.items[0] !== 'object' ? null : initialOpts.keyField) as Array<ItemKey<TItem, TKeyField>>
  if (initialOpts.cache) {
    restoreCache(initialOpts.cache)
  }
  if (initialOpts.prerender) {
    _prerender = true
    updateVisibleItems(false)
  }

  if (initialOpts.gridItems && !initialOpts.itemSize) {
    console.error('[vue-recycle-scroller] You must provide an itemSize when using gridItems')
  }

  onMounted(() => {
    applyPageMode()
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
  watch(() => toValue(options).cache, (snapshot) => {
    restoreCache(snapshot)
    updateVisibleItems(true)
  })

  watch(() => toValue(options).items, (nextItems, previousItems) => {
    const opts = toValue(options)
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

  watch(() => toValue(options).pageMode, () => {
    applyPageMode()
    updateVisibleItems(false)
  })

  watch(sizes, () => {
    if (applyShiftAnchor()) {
      scheduleShiftAnchorClear()
    }
    updateVisibleItems(false)
  }, { deep: true })

  watch(() => toValue(options).gridItems, () => {
    updateVisibleItems(true)
  })

  watch(() => toValue(options).itemSecondarySize, () => {
    updateVisibleItems(true)
  })

  return {
    pool,
    visiblePool,
    totalSize,
    ready,
    sizes,
    simpleArray,
    scrollToItem,
    scrollToPosition,
    getScroll,
    findItemIndex,
    getItemOffset,
    getItemSize,
    cacheSnapshot,
    restoreCache,
    updateVisibleItems,
    handleScroll,
    handleResize,
    handleVisibilityChange,
    sortViews,
  }
}

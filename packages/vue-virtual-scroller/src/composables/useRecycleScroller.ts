import type { ComputedRef, MaybeRef, MaybeRefOrGetter, Ref } from 'vue'
import type { ScrollDirection, ScrollState, Sizes, View, ViewNonReactive } from '../types'
import { computed, markRaw, nextTick, onActivated, onBeforeUnmount, onMounted, ref, shallowReactive, toValue, watch } from 'vue'
import config from '../config'
import { getScrollParent } from '../scrollparent'
import { supportsPassive } from '../utils'

export interface UseRecycleScrollerOptions {
  items: unknown[]
  keyField: string
  direction: ScrollDirection
  itemSize: number | null
  gridItems?: number
  itemSecondarySize?: number
  minItemSize: number | string | null
  sizeField: string
  typeField: string
  buffer: number
  pageMode: boolean
  prerender: number
  emitUpdate: boolean
  updateInterval: number
}

export interface UseRecycleScrollerReturn {
  pool: Ref<View[]>
  totalSize: Ref<number>
  ready: Ref<boolean>
  sizes: ComputedRef<Sizes | never[]>
  simpleArray: ComputedRef<boolean>
  scrollToItem: (index: number) => void
  scrollToPosition: (position: number) => void
  getScroll: () => ScrollState
  updateVisibleItems: (itemsChanged: boolean, checkPositionDiff?: boolean) => { continuous: boolean }
  handleScroll: () => void
  handleResize: () => void
  handleVisibilityChange: (isVisible: boolean, entry: IntersectionObserverEntry) => void
  sortViews: () => void
}

let uid = 0

export function useRecycleScroller(
  options: MaybeRefOrGetter<UseRecycleScrollerOptions>,
  el: MaybeRef<HTMLElement | undefined>,
  before?: MaybeRef<HTMLElement | undefined>,
  after?: MaybeRef<HTMLElement | undefined>,
  callbacks?: {
    onResize?: () => void
    onVisible?: () => void
    onHidden?: () => void
    onUpdate?: (startIndex: number, endIndex: number, visibleStartIndex: number, visibleEndIndex: number) => void
  },
): UseRecycleScrollerReturn {
  // Reactive state
  const pool = ref<View[]>([])
  const totalSize = ref(0)
  const ready = ref(false)

  // Internal state (non-reactive)
  let _startIndex = 0
  let _endIndex = 0
  const _views = new Map<string | number, View>()
  const _recycledPools = new Map<unknown, View[]>()
  let _scrollDirty = false
  let _lastUpdateScrollPosition = 0
  let _prerender = false
  let _updateTimeout: ReturnType<typeof setTimeout> | null = null
  let _refreshTimout: ReturnType<typeof setTimeout> | null = null
  let _sortTimer: ReturnType<typeof setTimeout> | null = null
  let _computedMinItemSize = 0
  let _listenerTarget: (Window | Element) | null = null

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
      const field = opts.sizeField
      const minItemSize = opts.minItemSize as number
      let computedMinSize = 10000
      let accumulator = 0
      let current: number
      for (let i = 0, l = items.length; i < l; i++) {
        current = (items[i] as any)[field] || minItemSize
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

  // Methods
  function getRecycledPool(type: unknown): View[] {
    let recycledPool = _recycledPools.get(type)
    if (!recycledPool) {
      recycledPool = []
      _recycledPools.set(type, recycledPool)
    }
    return recycledPool
  }

  function createView(viewPool: View[], index: number, item: unknown, key: string | number, type: unknown): View {
    const nr: ViewNonReactive = markRaw({
      id: uid++,
      index,
      used: true,
      key,
      type,
    })
    const view: View = shallowReactive({
      item,
      position: 0,
      offset: 0,
      nr,
    })
    viewPool.push(view)
    return view
  }

  function getRecycledView(type: unknown): View | undefined {
    const recycledPool = getRecycledPool(type)
    if (recycledPool && recycledPool.length) {
      const view = recycledPool.pop()!
      view.nr.used = true
      return view
    }
    return undefined
  }

  function removeAndRecycleView(view: View) {
    const type = view.nr.type
    const recycledPool = getRecycledPool(type)
    recycledPool.push(view)
    view.nr.used = false
    view.position = -9999
    _views.delete(view.nr.key)
  }

  function removeAndRecycleAllViews() {
    _views.clear()
    _recycledPools.clear()
    for (let i = 0, l = pool.value.length; i < l; i++) {
      removeAndRecycleView(pool.value[i])
    }
  }

  function handleResize() {
    callbacks?.onResize?.()
    if (ready.value)
      updateVisibleItems(false)
  }

  function handleScroll() {
    const opts = toValue(options)
    if (!_scrollDirty) {
      _scrollDirty = true
      if (_updateTimeout)
        return

      const requestUpdate = () => requestAnimationFrame(() => {
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
        requestAnimationFrame(() => {
          updateVisibleItems(false)
        })
      }
      else {
        callbacks?.onHidden?.()
      }
    }
  }

  function getListenerTarget(): Window | Element {
    const target: Element | undefined = getScrollParent(toValue(el)!)
    // Fix global scroll target for Chrome and Safari
    if (window.document && (target === window.document.documentElement || target === window.document.body)) {
      return window
    }
    return target || window
  }

  function getScroll(): ScrollState {
    const elValue = toValue(el)!
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
        start: elValue.scrollLeft,
        end: elValue.scrollLeft + elValue.clientWidth,
      }
    }

    return scrollState
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

      // Skip update if user hasn't scrolled enough
      if (checkPositionDiff) {
        let positionDiff = scroll.start - _lastUpdateScrollPosition
        if (positionDiff < 0)
          positionDiff = -positionDiff
        if ((itemSize === null && positionDiff < minItemSize) || (itemSize !== null && positionDiff < itemSize)) {
          return {
            continuous: true,
          }
        }
      }
      _lastUpdateScrollPosition = scroll.start

      const buffer = opts.buffer
      scroll.start -= buffer
      scroll.end += buffer

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

    if (endIndex - startIndex > config.itemsLimit) {
      itemsLimitError()
    }

    totalSize.value = totalSizeValue

    let view: View | undefined

    const continuous = startIndex <= _endIndex && endIndex >= _startIndex

    // Step 1: Mark any invisible elements as unused
    if (!continuous || itemsChanged) {
      removeAndRecycleAllViews()
    }
    else {
      for (let i = 0, l = poolValue.length; i < l; i++) {
        view = poolValue[i]
        if (view.nr.used) {
          const viewVisible = view.nr.index >= startIndex && view.nr.index < endIndex
          const viewSize = itemSize || (sizesValue[i] && sizesValue[i].size)
          if (!viewVisible || !viewSize) {
            removeAndRecycleView(view)
          }
        }
      }
    }

    // Step 2: Assign a view and update props for every view that became visible
    let item: unknown, type: unknown
    for (let i = startIndex; i < endIndex; i++) {
      const elementSize = itemSize || (sizesValue[i] && sizesValue[i].size)
      if (!elementSize)
        continue
      item = items[i]
      const key = keyField ? (item as any)[keyField] : i
      if (key == null) {
        throw new Error(`Key is ${key} on item (keyField is '${keyField}')`)
      }
      view = views.get(key)

      if (!view) {
        // Item just became visible
        type = (item as any)[typeField]
        view = getRecycledView(type)

        if (view) {
          view.item = item
          view.nr.index = i
          view.nr.key = key
          if (view.nr.type !== type) {
            console.warn('Reused view\'s type does not match pool\'s type')
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
        view.position = sizesValue[i - 1].accumulator
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
    setTimeout(() => {
      console.warn('It seems the scroller element isn\'t scrolling, so it tries to render all the items at once.', 'Scroller:', toValue(el))
      console.warn('Make sure the scroller has a fixed height (or width) and \'overflow-y\' (or \'overflow-x\') set to \'auto\' so it can scroll correctly and only render the items visible in the scroll viewport.')
    })
    throw new Error('Rendered items limit reached')
  }

  function isAnyVisibleGap(): boolean {
    return pool.value
      .filter(({ nr }) => nr.used)
      .every(({ nr }, i) => i === 0 || nr.index !== pool.value[i - 1].nr.index + 1)
  }

  function sortViews() {
    pool.value.sort((viewA, viewB) => viewA.nr.index - viewB.nr.index)

    if (isAnyVisibleGap()) {
      updateVisibleItems(false)
      if (_sortTimer)
        clearTimeout(_sortTimer)
    }
  }

  function scrollToItem(index: number) {
    const opts = toValue(options)
    let scroll: number
    const gridItems = opts.gridItems || 1
    if (opts.itemSize === null) {
      scroll = index > 0 ? (sizes.value as Sizes)[index - 1].accumulator : 0
    }
    else {
      scroll = Math.floor(index / gridItems) * opts.itemSize
    }
    scrollToPosition(scroll)
  }

  function scrollToPosition(position: number) {
    const opts = toValue(options)
    const elValue = toValue(el)!
    const direction = opts.direction === 'vertical'
      ? { scroll: 'scrollTop' as const, start: 'top' as const }
      : { scroll: 'scrollLeft' as const, start: 'left' as const }

    if (opts.pageMode) {
      const viewportEl = getScrollParent(elValue) as HTMLElement
      // HTML doesn't overflow like other elements
      const scrollTop = viewportEl.tagName === 'HTML' ? 0 : (viewportEl as any)[direction.scroll]
      const bounds = viewportEl.getBoundingClientRect()

      const scroller = elValue.getBoundingClientRect()
      const scrollerPosition = scroller[direction.start] - bounds[direction.start]

      ;(viewportEl as any)[direction.scroll] = position + scrollTop + scrollerPosition
    }
    else {
      ;(elValue as any)[direction.scroll] = position
    }
  }

  // In SSR mode, we also prerender the same number of item for the first render
  const initialOpts = toValue(options)
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
      // In SSR mode, render the real number of visible items
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
    removeListeners()
  })

  // Watchers
  watch(() => toValue(options).items, () => {
    updateVisibleItems(true)
  })

  watch(() => toValue(options).pageMode, () => {
    applyPageMode()
    updateVisibleItems(false)
  })

  watch(sizes, () => {
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
    totalSize,
    ready,
    sizes,
    simpleArray,
    scrollToItem,
    scrollToPosition,
    getScroll,
    updateVisibleItems,
    handleScroll,
    handleResize,
    handleVisibilityChange,
    sortViews,
  }
}

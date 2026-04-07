import type { ComputedRef, Directive, MaybeRef, MaybeRefOrGetter } from 'vue'
import type { CacheSnapshot, ItemKey, ItemWithSize, KeyValue, ScrollDirection, ValidKeyField, View, VScrollData } from '../types'
import type { DynamicScrollerItemControllerCallbacks, DynamicScrollerItemControllerOptions, DynamicScrollerMeasurementContext, DynamicScrollerUpdatePayload } from './dynamicScrollerMeasurement'
import type { UseRecycleScrollerOptions, UseRecycleScrollerReturn } from './useRecycleScroller'
import mitt from 'mitt'
import { computed, effectScope, nextTick, onActivated, onDeactivated, onUnmounted, provide, reactive, shallowRef, toValue, watch } from 'vue'
import { findPrependOffset, getItemKeys, restoreCacheMap } from '../engine/cache'
import { createDynamicScrollerItemController } from './dynamicScrollerMeasurement'
import { useRecycleScroller } from './useRecycleScroller'

export interface UseDynamicScrollerItemViewBindingOptions<TItem = unknown, TKey = KeyValue> {
  view: View<ItemWithSize<TItem, TKey>, TKey>
  watchData?: boolean
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

export interface UseDynamicScrollerOptions<TItem = unknown, TKeyField extends string = 'id'> {
  items: TItem[]
  keyField: ValidKeyField<TItem, TKeyField>
  direction: ScrollDirection
  minItemSize: number | string
  el: MaybeRef<HTMLElement | undefined>
  before?: MaybeRef<HTMLElement | undefined>
  after?: MaybeRef<HTMLElement | undefined>
  buffer?: number
  pageMode?: boolean
  shift?: boolean
  cache?: CacheSnapshot
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
type UseDynamicScrollerPool<TItem, TKey> = UseDynamicScrollerRecycleReturn<TItem, TKey>['pool']
type UseDynamicScrollerVisiblePool<TItem, TKey> = UseDynamicScrollerRecycleReturn<TItem, TKey>['visiblePool']
type UseDynamicScrollerHandleResize<TItem, TKey> = UseDynamicScrollerRecycleReturn<TItem, TKey>['handleResize']
type UseDynamicScrollerHandleVisibilityChange<TItem, TKey> = UseDynamicScrollerRecycleReturn<TItem, TKey>['handleVisibilityChange']
type UseDynamicScrollerHandleScroll<TItem, TKey> = UseDynamicScrollerRecycleReturn<TItem, TKey>['handleScroll']
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
  ready: UseDynamicScrollerReady<TItem, TKey>
  sizes: UseDynamicScrollerSizes<TItem, TKey>
  forceUpdate: (clear?: boolean) => void
  scrollToItem: UseDynamicScrollerScrollToItem<TItem, TKey>
  scrollToPosition: UseDynamicScrollerScrollToPosition<TItem, TKey>
  getScroll: UseDynamicScrollerGetScroll<TItem, TKey>
  findItemIndex: UseDynamicScrollerFindItemIndex<TItem, TKey>
  getItemOffset: UseDynamicScrollerGetItemOffset<TItem, TKey>
  updateVisibleItems: UseDynamicScrollerUpdateVisibleItems<TItem, TKey>
  handleScroll: UseDynamicScrollerHandleScroll<TItem, TKey>
  handleResize: UseDynamicScrollerHandleResize<TItem, TKey>
  handleVisibilityChange: UseDynamicScrollerHandleVisibilityChange<TItem, TKey>
  sortViews: UseDynamicScrollerSortViews<TItem, TKey>
  cacheSnapshot: UseDynamicScrollerCacheSnapshot<TItem, TKey>
  restoreCache: UseDynamicScrollerRestoreCache<TItem, TKey>
  getItemSize: (item: TItem, index?: number) => number
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
  options: ReturnType<typeof shallowRef<BoundDynamicScrollerItemOptions<TItem>>>
  callbacks: ReturnType<typeof shallowRef<DynamicScrollerItemControllerCallbacks>>
  el: ReturnType<typeof shallowRef<HTMLElement | undefined>>
  controller: ReturnType<typeof createDynamicScrollerItemController>
  restoreStyles: Record<string, string>
}

type VScrollUpdateHandler = (payload?: unknown) => void

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

function viewItemWithSize<TItem, TKey>(view: View<ItemWithSize<TItem, TKey>, TKey>) {
  return view.item
}

function getViewStyleStamp<TItem, TKey>(view: View<TItem, TKey>) {
  return ((view as View<TItem, TKey> & { _vs_styleStamp?: number })._vs_styleStamp) ?? 0
}

const MANAGED_STYLE_PROPS = [
  'position',
  'top',
  'left',
  'transform',
  'willChange',
  'visibility',
  'pointerEvents',
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

function applyViewStyles(
  elValue: HTMLElement,
  binding: UseDynamicScrollerItemBindingOptions<any, any>,
  direction: ScrollDirection,
  snapshot: Record<string, string>,
) {
  if (!('view' in binding)) {
    restoreManagedStyles(elValue, snapshot)
    return
  }

  const isVertical = direction === 'vertical'
  const isTableRow = elValue.tagName === 'TR'
  const offsetTransform = isVertical
    ? `translateY(${binding.view.position}px) translateX(${binding.view.offset}px)`
    : `translateX(${binding.view.position}px) translateY(${binding.view.offset}px)`

  elValue.style.position = 'absolute'
  elValue.style.top = isVertical ? (isTableRow ? `${binding.view.position}px` : '0px') : '0px'
  elValue.style.left = !isVertical && isTableRow ? `${binding.view.position}px` : '0px'
  elValue.style.transform = isTableRow ? '' : offsetTransform
  elValue.style.willChange = isTableRow ? 'unset' : 'transform'
  elValue.style.visibility = binding.view.nr.used ? 'visible' : 'hidden'
  elValue.style.pointerEvents = binding.view.nr.used ? '' : 'none'
}

function normalizeBindingOptions<TItem, TKey>(options: UseDynamicScrollerItemBindingOptions<TItem, TKey>): BoundDynamicScrollerItemOptions<TItem> {
  if ('view' in options) {
    const itemWithSize = viewItemWithSize(options.view)
    return {
      item: itemWithSize.item,
      active: options.view.nr.used,
      index: options.view.nr.index,
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

function getDynamicItemId<TItem, TKeyField extends string>(
  item: TItem,
  keyField: ValidKeyField<TItem, TKeyField>,
  simpleArray: boolean,
  index?: number,
): ItemKey<TItem, TKeyField> | null {
  if (simpleArray) {
    if (index == null) {
      return null
    }
    return index as ItemKey<TItem, TKeyField>
  }

  return ((item as any)?.[keyField] ?? null) as ItemKey<TItem, TKeyField> | null
}

export function useDynamicScroller<TItem, TKeyField extends string = 'id'>(
  options: MaybeRefOrGetter<UseDynamicScrollerOptions<TItem, TKeyField>>,
): UseDynamicScrollerReturn<TItem, ItemKey<TItem, TKeyField>> {
  // Internal state (non-reactive)
  let _undefinedSizes = 0
  let _undefinedMap: Record<KeyValue, boolean | undefined> = {}
  const _events = mitt()
  let _scrollingToBottom = false
  let _resizeObserver: ResizeObserver | undefined
  let _applyingShiftAnchor = false
  let _previousKeys: Array<ItemKey<TItem, TKeyField>> = []
  let _shiftAnchor: DynamicScrollerShiftAnchor<ItemKey<TItem, TKeyField>> | null = null
  let _shiftAnchorRaf: number | null = null
  const _rafIds = new Set<number>()

  // Reactive state
  const vscrollData = reactive<VScrollData>({
    active: true,
    sizes: {},
    keyField: toValue(options).keyField,
    simpleArray: false,
  })

  const direction = computed(() => toValue(options).direction)
  const el = computed(() => toValue(toValue(options).el))
  const before = computed(() => toValue(toValue(options).before))
  const after = computed(() => toValue(toValue(options).after))
  const anchorRegistry = new Map<HTMLElement, DynamicScrollerAnchorRecord>()

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
    const opts = toValue(options)
    return opts.items.length > 0 && typeof opts.items[0] !== 'object'
  })

  const itemsWithSize = computed<Array<ItemWithSize<TItem, ItemKey<TItem, TKeyField>>>>(() => {
    const result: Array<ItemWithSize<TItem, ItemKey<TItem, TKeyField>>> = []
    const opts = toValue(options)
    const { items, keyField } = opts
    const simple = simpleArray.value
    const sizes = vscrollData.sizes
    const l = items.length
    for (let i = 0; i < l; i++) {
      const item = items[i]
      const id = (simple ? i : (item as any)[keyField]) as ItemKey<TItem, TKeyField>
      let size: number | undefined = sizes[id]
      if (typeof size === 'undefined' && !_undefinedMap[id]) {
        size = 0
      }
      result.push({
        item,
        id,
        size,
      })
    }
    return result
  })

  const initialOpts = toValue(options)
  _previousKeys = getItemKeys(initialOpts.items, simpleArray.value ? null : initialOpts.keyField) as Array<ItemKey<TItem, TKeyField>>
  if (initialOpts.cache) {
    vscrollData.sizes = restoreCacheMap(initialOpts.cache, initialOpts.items, simpleArray.value ? null : initialOpts.keyField)
  }

  const recycleOptions = computed<UseRecycleScrollerOptions<ItemWithSize<TItem, ItemKey<TItem, TKeyField>>, 'id', 'size'>>(() => {
    const opts = toValue(options)
    return {
      items: itemsWithSize.value,
      keyField: 'id',
      direction: opts.direction,
      itemSize: null,
      gridItems: undefined,
      itemSecondarySize: undefined,
      minItemSize: opts.minItemSize,
      sizeField: 'size',
      typeField: 'type',
      buffer: opts.buffer ?? 200,
      pageMode: opts.pageMode ?? false,
      shift: false,
      cache: opts.cache,
      prerender: opts.prerender ?? 0,
      emitUpdate: opts.emitUpdate ?? false,
      updateInterval: opts.updateInterval ?? 0,
    }
  })

  function onScrollerResize() {
    forceUpdate()
    toValue(options).onResize?.()
  }

  function onScrollerVisible() {
    _events.emit('vscroll:update', { force: false })
    toValue(options).onVisible?.()
  }

  const recycleScroller = useRecycleScroller<ItemWithSize<TItem, ItemKey<TItem, TKeyField>>, 'id', 'size'>(
    recycleOptions,
    el,
    before,
    after,
    {
      onResize: onScrollerResize,
      onVisible: onScrollerVisible,
      onHidden: () => toValue(options).onHidden?.(),
      onUpdate: (startIndex, endIndex, visibleStartIndex, visibleEndIndex) =>
        toValue(options).onUpdate?.(startIndex, endIndex, visibleStartIndex, visibleEndIndex),
    },
  )

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

    if (shiftAnchor.visualKey != null) {
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
    const bindingOptions = shallowRef(value)
    const callbacks = shallowRef<DynamicScrollerItemControllerCallbacks>({
      onResize: value.onResize,
    })
    const elRef = shallowRef<HTMLElement | undefined>(elValue)
    const controller = scope.run(() => {
      watch(() => {
        const currentBinding = binding.value
        if (!('view' in currentBinding)) {
          return {
            active: bindingOptions.value.active,
            direction: direction.value,
            id: getDynamicItemId(
              bindingOptions.value.item,
              toValue(options).keyField,
              vscrollData.simpleArray,
              bindingOptions.value.index,
            ),
            legacy: true,
          }
        }

        const { view } = currentBinding
        return {
          active: view.nr.used,
          direction: direction.value,
          id: viewItemWithSize(view).id,
          legacy: false,
          position: view.position,
          offset: view.offset,
          styleStamp: getViewStyleStamp(view),
        }
      }, () => {
        const currentEl = elRef.value
        if (currentEl) {
          const currentBinding = binding.value
          const currentId = 'view' in currentBinding
            ? viewItemWithSize(currentBinding.view).id
            : getDynamicItemId(
                bindingOptions.value.item,
                toValue(options).keyField,
                vscrollData.simpleArray,
                bindingOptions.value.index,
              )
          if (currentId != null) {
            anchorRegistry.set(currentEl, {
              active: bindingOptions.value.active && vscrollData.active,
              id: currentId,
            })
          }
          applyViewStyles(currentEl, binding.value, direction.value, restoreStyles)
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
      mountBinding(elValue, binding.value, normalizeBindingOptions(binding.value), restoreStyles)
    },
    updated(elValue, binding) {
      const record = bindings.get(elValue)
      const normalizedValue = normalizeBindingOptions(binding.value)

      if (!record) {
        const restoreStyles = captureManagedStyles(elValue)
        mountBinding(elValue, binding.value, normalizedValue, restoreStyles)
        return
      }

      record.binding.value = binding.value
      record.options.value = normalizedValue
      record.callbacks.value = {
        onResize: normalizedValue.onResize,
      }
      record.el.value = elValue
      applyViewStyles(elValue, binding.value, direction.value, record.restoreStyles)
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
    const opts = toValue(options)
    vscrollData.sizes = restoreCacheMap(snapshot, opts.items, simpleArray.value ? null : opts.keyField)
    return recycleScroller.restoreCache(snapshot)
  }

  function getItemSize(item: TItem, index?: number): number {
    const opts = toValue(options)
    const id = simpleArray.value ? (index ?? opts.items.indexOf(item)) : (item as any)[opts.keyField]
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
  }

  // Watchers
  watch(() => toValue(options).items, (nextItems, previousItems) => {
    const opts = toValue(options)
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

  watch(() => toValue(options).cache, (snapshot) => {
    if (snapshot) {
      restoreCache(snapshot)
    }
  })

  watch(simpleArray, (value) => {
    vscrollData.simpleArray = value
  }, { immediate: true })

  watch(() => toValue(options).direction, () => {
    clearShiftAnchor()
    forceUpdate(true)
  })

  watch(el, (nextEl, previousEl) => {
    previousEl?.removeEventListener('scroll', onNativeScroll)
    nextEl?.addEventListener('scroll', onNativeScroll)
  }, {
    immediate: true,
  })

  watch(itemsWithSize, (next, prev) => {
    const elValue = el.value
    if (!elValue)
      return

    if (_shiftAnchor) {
      alignShiftAnchor()
      return
    }

    const scrollTop = elValue.scrollTop

    // Calculate total diff between prev and next sizes
    // over current scroll top. Then add it to scrollTop to
    // avoid jumping the contents that the user is seeing.
    const opts = toValue(options)
    let prevActiveTop = 0
    let activeTop = 0
    const length = Math.min(next.length, prev.length)
    for (let i = 0; i < length; i++) {
      if (prevActiveTop >= scrollTop) {
        break
      }
      prevActiveTop += (prev[i].size || opts.minItemSize as number)
      activeTop += (next[i].size || opts.minItemSize as number)
    }
    const offset = activeTop - prevActiveTop

    if (offset === 0) {
      return
    }

    elValue.scrollTop += offset
  }, { flush: 'post' })

  // Lifecycle
  onActivated(() => {
    vscrollData.active = true
  })

  onDeactivated(() => {
    vscrollData.active = false
  })

  onUnmounted(() => {
    cancelShiftAnchorFrame()
    cancelPendingFrames()
    el.value?.removeEventListener('scroll', onNativeScroll)
    _events.all.clear()
  })

  return {
    vscrollData,
    itemsWithSize,
    resizeObserver: _resizeObserver,
    measurementContext,
    vDynamicScrollerItem,
    ...recycleScroller,
    simpleArray,
    forceUpdate,
    scrollToItem,
    restoreCache,
    getItemSize,
    scrollToBottom,
    onScrollerResize,
    onScrollerVisible,
  }
}

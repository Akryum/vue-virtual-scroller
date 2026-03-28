import type { ComputedRef, Directive, MaybeRef, MaybeRefOrGetter } from 'vue'
import type { ItemWithSize, ScrollDirection, VScrollData, View } from '../types'
import type { DynamicScrollerItemControllerCallbacks, DynamicScrollerItemControllerOptions, DynamicScrollerMeasurementContext, DynamicScrollerUpdatePayload } from './dynamicScrollerMeasurement'
import type { UseRecycleScrollerReturn } from './useRecycleScroller'
import mitt from 'mitt'
import { computed, effectScope, nextTick, onActivated, onDeactivated, onUnmounted, provide, reactive, shallowRef, toValue, watch } from 'vue'
import { createDynamicScrollerItemController } from './dynamicScrollerMeasurement'
import { useRecycleScroller } from './useRecycleScroller'

export interface UseDynamicScrollerItemViewBindingOptions {
  view: View
  watchData?: boolean
  sizeDependencies?: Record<string, unknown> | unknown[] | null
  emitResize?: boolean
  onResize?: DynamicScrollerItemControllerCallbacks['onResize']
}

interface UseDynamicScrollerItemLegacyBindingOptions extends Omit<DynamicScrollerItemControllerOptions, 'watchData' | 'emitResize'> {
  watchData?: boolean
  emitResize?: boolean
  onResize?: DynamicScrollerItemControllerCallbacks['onResize']
}

export type UseDynamicScrollerItemBindingOptions =
  | UseDynamicScrollerItemViewBindingOptions
  | UseDynamicScrollerItemLegacyBindingOptions

export interface UseDynamicScrollerOptions {
  items: unknown[]
  keyField: string
  direction: ScrollDirection
  minItemSize: number | string
  el: MaybeRef<HTMLElement | undefined>
  before?: MaybeRef<HTMLElement | undefined>
  after?: MaybeRef<HTMLElement | undefined>
  buffer?: number
  pageMode?: boolean
  prerender?: number
  emitUpdate?: boolean
  updateInterval?: number
  onResize?: () => void
  onVisible?: () => void
  onHidden?: () => void
  onUpdate?: (startIndex: number, endIndex: number, visibleStartIndex: number, visibleEndIndex: number) => void
}

type UseDynamicScrollerSizes = UseRecycleScrollerReturn['sizes']
type UseDynamicScrollerReady = UseRecycleScrollerReturn['ready']
type UseDynamicScrollerPool = UseRecycleScrollerReturn['pool']
type UseDynamicScrollerVisiblePool = UseRecycleScrollerReturn['visiblePool']
type UseDynamicScrollerHandleResize = UseRecycleScrollerReturn['handleResize']
type UseDynamicScrollerHandleVisibilityChange = UseRecycleScrollerReturn['handleVisibilityChange']
type UseDynamicScrollerHandleScroll = UseRecycleScrollerReturn['handleScroll']
type UseDynamicScrollerGetScroll = UseRecycleScrollerReturn['getScroll']
type UseDynamicScrollerScrollToPosition = UseRecycleScrollerReturn['scrollToPosition']
type UseDynamicScrollerSortViews = UseRecycleScrollerReturn['sortViews']
type UseDynamicScrollerTotalSize = UseRecycleScrollerReturn['totalSize']
type UseDynamicScrollerUpdateVisibleItems = UseRecycleScrollerReturn['updateVisibleItems']

export interface UseDynamicScrollerReturn {
  vscrollData: VScrollData
  itemsWithSize: ComputedRef<ItemWithSize[]>
  simpleArray: ComputedRef<boolean>
  resizeObserver: ResizeObserver | undefined
  measurementContext: DynamicScrollerMeasurementContext
  vDynamicScrollerItem: Directive<HTMLElement, UseDynamicScrollerItemBindingOptions>
  pool: UseDynamicScrollerPool
  visiblePool: UseDynamicScrollerVisiblePool
  totalSize: UseDynamicScrollerTotalSize
  ready: UseDynamicScrollerReady
  sizes: UseDynamicScrollerSizes
  forceUpdate: (clear?: boolean) => void
  scrollToItem: (index: number) => void
  scrollToPosition: UseDynamicScrollerScrollToPosition
  getScroll: UseDynamicScrollerGetScroll
  updateVisibleItems: UseDynamicScrollerUpdateVisibleItems
  handleScroll: UseDynamicScrollerHandleScroll
  handleResize: UseDynamicScrollerHandleResize
  handleVisibilityChange: UseDynamicScrollerHandleVisibilityChange
  sortViews: UseDynamicScrollerSortViews
  getItemSize: (item: unknown, index?: number) => number
  scrollToBottom: () => void
  onScrollerResize: () => void
  onScrollerVisible: () => void
}

interface BoundDynamicScrollerItemOptions extends DynamicScrollerItemControllerOptions {
  onResize?: DynamicScrollerItemControllerCallbacks['onResize']
}

interface DynamicScrollerItemBindingRecord {
  binding: ReturnType<typeof shallowRef<UseDynamicScrollerItemBindingOptions>>
  scope: ReturnType<typeof effectScope>
  options: ReturnType<typeof shallowRef<BoundDynamicScrollerItemOptions>>
  callbacks: ReturnType<typeof shallowRef<DynamicScrollerItemControllerCallbacks>>
  el: ReturnType<typeof shallowRef<HTMLElement | undefined>>
  controller: ReturnType<typeof createDynamicScrollerItemController>
  restoreStyles: Record<string, string>
}

function viewItemWithSize(view: View) {
  return view.item as ItemWithSize
}

function getViewStyleStamp(view: View) {
  return ((view as View & { _vs_styleStamp?: number })._vs_styleStamp) ?? 0
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
  binding: UseDynamicScrollerItemBindingOptions,
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

function normalizeBindingOptions(options: UseDynamicScrollerItemBindingOptions): BoundDynamicScrollerItemOptions {
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

export function useDynamicScroller(
  options: MaybeRefOrGetter<UseDynamicScrollerOptions>,
): UseDynamicScrollerReturn {
  // Internal state (non-reactive)
  let _undefinedSizes = 0
  let _undefinedMap: Record<string | number, boolean | undefined> = {}
  const _events = mitt<Record<'vscroll:update', DynamicScrollerUpdatePayload>>()
  let _scrollingToBottom = false
  let _resizeObserver: ResizeObserver | undefined

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

  // ResizeObserver setup
  if (typeof ResizeObserver !== 'undefined') {
    _resizeObserver = new ResizeObserver((entries) => {
      requestAnimationFrame(() => {
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
      _events.on('vscroll:update', callback)
      return () => _events.off('vscroll:update', callback)
    },
  }

  // Provide
  provide('vscrollData', vscrollData)
  provide('vscrollParent', {
    get $_undefinedSizes() { return _undefinedSizes },
    set $_undefinedSizes(v: number) { _undefinedSizes = v },
    get $_undefinedMap() { return _undefinedMap },
    set $_undefinedMap(v: Record<string | number, boolean | undefined>) { _undefinedMap = v },
    $_events: _events,
    direction,
  })
  provide('vscrollResizeObserver', _resizeObserver)
  provide('vscrollMeasurementContext', measurementContext)

  // Computed
  const simpleArray = computed(() => {
    const opts = toValue(options)
    return opts.items.length > 0 && typeof opts.items[0] !== 'object'
  })

  const itemsWithSize = computed<ItemWithSize[]>(() => {
    const result: ItemWithSize[] = []
    const opts = toValue(options)
    const { items, keyField } = opts
    const simple = simpleArray.value
    const sizes = vscrollData.sizes
    const l = items.length
    for (let i = 0; i < l; i++) {
      const item = items[i]
      const id = simple ? i : (item as any)[keyField]
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

  const recycleOptions = computed(() => {
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

  const recycleScroller = useRecycleScroller(
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

  const bindings = new WeakMap<HTMLElement, DynamicScrollerItemBindingRecord>()

  function mountBinding(
    elValue: HTMLElement,
    bindingValue: UseDynamicScrollerItemBindingOptions,
    value: BoundDynamicScrollerItemOptions,
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
            direction: direction.value,
            legacy: true,
          }
        }

        const { view } = currentBinding
        return {
          direction: direction.value,
          legacy: false,
          position: view.position,
          offset: view.offset,
          styleStamp: getViewStyleStamp(view),
        }
      }, () => {
        const currentEl = elRef.value
        if (currentEl) {
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

  const vDynamicScrollerItem: Directive<HTMLElement, UseDynamicScrollerItemBindingOptions> = {
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

  function scrollToItem(index: number) {
    recycleScroller.scrollToItem(index)
  }

  function getItemSize(item: unknown, index?: number): number {
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
        requestAnimationFrame(() => {
          elValue.scrollTop = elValue.scrollHeight + 5000
          if (_undefinedSizes === 0) {
            _scrollingToBottom = false
          }
          else {
            requestAnimationFrame(cb)
          }
        })
      }
      requestAnimationFrame(cb)
    })
  }

  // Watchers
  watch(() => toValue(options).items, () => {
    forceUpdate()
  })

  watch(simpleArray, (value) => {
    vscrollData.simpleArray = value
  }, { immediate: true })

  watch(() => toValue(options).direction, () => {
    forceUpdate(true)
  })

  watch(itemsWithSize, (next, prev) => {
    const elValue = el.value
    if (!elValue)
      return
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
  })

  // Lifecycle
  onActivated(() => {
    vscrollData.active = true
  })

  onDeactivated(() => {
    vscrollData.active = false
  })

  onUnmounted(() => {
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
    getItemSize,
    scrollToBottom,
    onScrollerResize,
    onScrollerVisible,
  }
}

import { type ComputedRef, type MaybeRef, type MaybeRefOrGetter, computed, nextTick, onActivated, onDeactivated, onUnmounted, provide, reactive, toValue, watch } from 'vue'
import mitt from 'mitt'
import type { ItemWithSize, ScrollDirection, VScrollData } from '../types'

export interface UseDynamicScrollerOptions {
  items: unknown[]
  keyField: string
  direction: ScrollDirection
  minItemSize: number | string
}

export interface UseDynamicScrollerReturn {
  vscrollData: VScrollData
  itemsWithSize: ComputedRef<ItemWithSize[]>
  simpleArray: ComputedRef<boolean>
  resizeObserver: ResizeObserver | undefined
  forceUpdate: (clear?: boolean) => void
  scrollToItem: (index: number) => void
  getItemSize: (item: unknown, index?: number) => number
  scrollToBottom: () => void
  onScrollerResize: () => void
  onScrollerVisible: () => void
}

export function useDynamicScroller(
  options: MaybeRefOrGetter<UseDynamicScrollerOptions>,
  scrollerRef: MaybeRef<{ scrollToItem: (index: number) => void } | undefined>,
  el: MaybeRef<HTMLElement | undefined>,
  callbacks?: {
    onResize?: () => void
    onVisible?: () => void
  },
): UseDynamicScrollerReturn {
  // Internal state (non-reactive)
  let _undefinedSizes = 0
  let _undefinedMap: Record<string | number, boolean | undefined> = {}
  const _events = mitt()
  let _scrollingToBottom = false
  let _resizeObserver: ResizeObserver | undefined

  // Reactive state
  const vscrollData = reactive<VScrollData>({
    active: true,
    sizes: {},
    keyField: toValue(options).keyField,
    simpleArray: false,
  })

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

  // Provide
  provide('vscrollData', vscrollData)
  provide('vscrollParent', {
    get $_undefinedSizes() { return _undefinedSizes },
    set $_undefinedSizes(v: number) { _undefinedSizes = v },
    get $_undefinedMap() { return _undefinedMap },
    set $_undefinedMap(v: Record<string | number, boolean | undefined>) { _undefinedMap = v },
    $_events: _events,
    direction: computed(() => toValue(options).direction),
  })
  provide('vscrollResizeObserver', _resizeObserver)

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

  // Methods
  function onScrollerResize() {
    if (toValue(scrollerRef)) {
      forceUpdate()
    }
    callbacks?.onResize?.()
  }

  function onScrollerVisible() {
    _events.emit('vscroll:update', { force: false })
    callbacks?.onVisible?.()
  }

  function forceUpdate(clear = false) {
    if (clear || simpleArray.value) {
      vscrollData.sizes = {}
    }
    _events.emit('vscroll:update', { force: true })
  }

  function scrollToItem(index: number) {
    const scroller = toValue(scrollerRef)
    if (scroller) scroller.scrollToItem(index)
  }

  function getItemSize(item: unknown, index?: number): number {
    const opts = toValue(options)
    const id = simpleArray.value ? (index != null ? index : opts.items.indexOf(item)) : (item as any)[opts.keyField]
    return vscrollData.sizes[id] || 0
  }

  function scrollToBottom() {
    const elValue = toValue(el)
    if (!elValue) return
    if (_scrollingToBottom) return
    _scrollingToBottom = true
    // Item is inserted to the DOM
    nextTick(() => {
      elValue.scrollTop = elValue.scrollHeight + 5000
      // Item sizes are computed
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
    const elValue = toValue(el)
    if (!elValue) return
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
    simpleArray,
    resizeObserver: _resizeObserver,
    forceUpdate,
    scrollToItem,
    getItemSize,
    scrollToBottom,
    onScrollerResize,
    onScrollerVisible,
  }
}

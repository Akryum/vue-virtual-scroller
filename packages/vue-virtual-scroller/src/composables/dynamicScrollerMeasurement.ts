import type { ComputedRef, MaybeRefOrGetter } from 'vue'
import type { KeyValue, ScrollDirection, VScrollData } from '../types'
import { computed, nextTick, toValue, watch } from 'vue'

export interface DynamicScrollerUpdatePayload {
  force: boolean
}

export interface DynamicScrollerMeasurementContext {
  vscrollData: VScrollData
  resizeObserver: ResizeObserver | undefined
  direction: ComputedRef<ScrollDirection>
  undefinedMap: Record<string | number, boolean | undefined>
  undefinedSizeCount: {
    value: number
  }
  onVscrollUpdate: (callback: (payload: DynamicScrollerUpdatePayload) => void) => () => void
}

export interface DynamicScrollerItemControllerOptions<TItem = unknown> {
  item: TItem
  watchData: boolean
  active: boolean
  index?: number
  sizeDependencies?: Record<string, unknown> | unknown[] | null
  emitResize: boolean
}

export interface DynamicScrollerItemControllerCallbacks {
  onResize?: (id: KeyValue) => void
}

export interface DynamicScrollerItemController {
  id: ComputedRef<KeyValue>
  size: ComputedRef<number>
  finalActive: ComputedRef<boolean>
  updateSize: () => void
  mount: () => void
  unmount: () => void
}

export function createDynamicScrollerItemController(
  options: MaybeRefOrGetter<DynamicScrollerItemControllerOptions<any>>,
  el: MaybeRefOrGetter<HTMLElement | undefined>,
  context: DynamicScrollerMeasurementContext,
  callbacks?: MaybeRefOrGetter<DynamicScrollerItemControllerCallbacks | undefined>,
): DynamicScrollerItemController {
  let _forceNextVScrollUpdate: KeyValue | null = null
  let _pendingSizeUpdate: KeyValue | null = null
  let _pendingVScrollUpdate: KeyValue | null = null
  let _sizeObserved = false
  let _watchDataStop: (() => void) | null = null
  const _cleanupStops: Array<() => void> = []
  const unsubscribeVscrollUpdate = context.resizeObserver
    ? () => {}
    : context.onVscrollUpdate(onVscrollUpdate)

  const id = computed<KeyValue>(() => {
    const opts = toValue(options)
    if (context.vscrollData.simpleArray) {
      if (opts.index == null) {
        throw new Error('index is required when using simple-array mode with dynamic item measurement')
      }
      return opts.index
    }
    if (context.vscrollData.keyField in (opts.item as any))
      return (opts.item as any)[context.vscrollData.keyField]
    throw new Error(`keyField '${context.vscrollData.keyField}' not found in your item. You should set a valid keyField prop on your Scroller`)
  })

  const size = computed(() => {
    return context.vscrollData.sizes[id.value] || 0
  })

  const finalActive = computed(() => {
    return toValue(options).active && context.vscrollData.active
  })

  function updateSize() {
    if (finalActive.value) {
      if (_pendingSizeUpdate !== id.value) {
        _pendingSizeUpdate = id.value
        _forceNextVScrollUpdate = null
        _pendingVScrollUpdate = null
        computeSize(id.value)
      }
    }
    else {
      _forceNextVScrollUpdate = id.value
    }
  }

  function updateWatchData() {
    const opts = toValue(options)
    if (opts.watchData && !context.resizeObserver) {
      _watchDataStop = watch(() => toValue(options).item, () => {
        onDataUpdate()
      }, {
        deep: true,
      })
    }
    else if (_watchDataStop) {
      _watchDataStop()
      _watchDataStop = null
    }
  }

  function onVscrollUpdate({ force }: DynamicScrollerUpdatePayload) {
    if (!finalActive.value && force) {
      _pendingVScrollUpdate = id.value
    }

    if (_forceNextVScrollUpdate === id.value || force || !size.value) {
      updateSize()
    }
  }

  function onDataUpdate() {
    updateSize()
  }

  function clearUndefinedState(targetId: KeyValue) {
    if (context.undefinedMap[targetId]) {
      context.undefinedSizeCount.value--
    }
    context.undefinedMap[targetId] = undefined
  }

  function syncUndefinedState(targetId: KeyValue, active: boolean) {
    if (context.vscrollData.sizes[targetId]) {
      clearUndefinedState(targetId)
      return
    }

    if (active) {
      if (!context.undefinedMap[targetId]) {
        context.undefinedSizeCount.value++
      }
      context.undefinedMap[targetId] = true
      return
    }

    if (context.undefinedMap[targetId]) {
      context.undefinedSizeCount.value--
      context.undefinedMap[targetId] = false
    }
  }

  function computeSize(targetId: KeyValue) {
    nextTick(() => {
      if (id.value === targetId) {
        const elValue = toValue(el)
        if (!elValue)
          return
        const width = elValue.offsetWidth
        const height = elValue.offsetHeight
        applyWidthHeight(width, height)
      }
      _pendingSizeUpdate = null
    })
  }

  function applyWidthHeight(width: number, height: number) {
    const sizeValue = ~~(context.direction.value === 'vertical' ? height : width)
    if (sizeValue && size.value !== sizeValue) {
      applySize(sizeValue)
    }
  }

  function applySize(sizeValue: number) {
    clearUndefinedState(id.value)
    context.vscrollData.sizes[id.value] = sizeValue
    if (toValue(options).emitResize)
      toValue(callbacks)?.onResize?.(id.value)
  }

  function observeSize() {
    if (!context.resizeObserver)
      return
    if (_sizeObserved)
      return
    const elValue = toValue(el)
    if (!elValue)
      return
    context.resizeObserver.observe(elValue)
    ;(elValue as any).$_vs_id = id.value
    ;(elValue as any).$_vs_onResize = onResize
    _sizeObserved = true
  }

  function unobserveSize() {
    if (!context.resizeObserver)
      return
    if (!_sizeObserved)
      return
    const elValue = toValue(el)
    if (!elValue)
      return
    context.resizeObserver.unobserve(elValue)
    ;(elValue as any).$_vs_onResize = undefined
    _sizeObserved = false
  }

  function onResize(targetId: KeyValue, width: number, height: number) {
    if (id.value === targetId) {
      applyWidthHeight(width, height)
    }
  }

  _cleanupStops.push(watch(() => toValue(options).watchData, () => {
    updateWatchData()
  }))

  if (!context.resizeObserver) {
    _cleanupStops.push(watch(() => toValue(options).sizeDependencies, () => {
      onDataUpdate()
    }, {
      deep: true,
    }))
  }

  _cleanupStops.push(watch(id, (value, oldValue) => {
    const elValue = toValue(el)
    if (elValue) {
      ;(elValue as any).$_vs_id = value
    }

    clearUndefinedState(oldValue)
    syncUndefinedState(value, finalActive.value)

    const newSize = context.vscrollData.sizes[value]
    if (!newSize) {
      _forceNextVScrollUpdate = value
      onDataUpdate()
      return
    }

    clearUndefinedState(value)

    if (_sizeObserved) {
      context.vscrollData.sizes[value] = newSize
    }
  }))

  _cleanupStops.push(watch(finalActive, (value) => {
    syncUndefinedState(id.value, value)

    if (context.resizeObserver) {
      if (value) {
        observeSize()
      }
      else {
        unobserveSize()
      }
    }
    else if (value && _pendingVScrollUpdate === id.value) {
      updateSize()
    }
  }))

  updateWatchData()

  function mount() {
    if (finalActive.value) {
      updateSize()
      observeSize()
    }
  }

  function unmount() {
    unsubscribeVscrollUpdate()
    unobserveSize()
    clearUndefinedState(id.value)
    const elValue = toValue(el)
    if (elValue) {
      ;(elValue as any).$_vs_id = undefined
      ;(elValue as any).$_vs_onResize = undefined
    }
    if (_watchDataStop) {
      _watchDataStop()
      _watchDataStop = null
    }
    for (const stop of _cleanupStops) {
      stop()
    }
    _cleanupStops.length = 0
  }

  return {
    id,
    size,
    finalActive,
    updateSize,
    mount,
    unmount,
  }
}

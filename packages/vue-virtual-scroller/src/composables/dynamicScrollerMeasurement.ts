import type { ComputedRef, MaybeRefOrGetter } from 'vue'
import type { ScrollDirection, VScrollData } from '../types'
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

export interface DynamicScrollerItemControllerOptions {
  item: unknown
  watchData: boolean
  active: boolean
  index?: number
  sizeDependencies?: Record<string, unknown> | unknown[] | null
  emitResize: boolean
}

export interface DynamicScrollerItemControllerCallbacks {
  onResize?: (id: string | number) => void
}

export interface DynamicScrollerItemController {
  id: ComputedRef<string | number>
  size: ComputedRef<number>
  finalActive: ComputedRef<boolean>
  updateSize: () => void
  mount: () => void
  unmount: () => void
}

export function createDynamicScrollerItemController(
  options: MaybeRefOrGetter<DynamicScrollerItemControllerOptions>,
  el: MaybeRefOrGetter<HTMLElement | undefined>,
  context: DynamicScrollerMeasurementContext,
  callbacks?: MaybeRefOrGetter<DynamicScrollerItemControllerCallbacks | undefined>,
): DynamicScrollerItemController {
  let _forceNextVScrollUpdate: string | number | null = null
  let _pendingSizeUpdate: string | number | null = null
  let _pendingVScrollUpdate: string | number | null = null
  let _sizeObserved = false
  let _watchDataStop: (() => void) | null = null
  const unsubscribeVscrollUpdate = context.resizeObserver
    ? () => {}
    : context.onVscrollUpdate(onVscrollUpdate)

  const id = computed<string | number>(() => {
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

  function clearUndefinedState(targetId: string | number) {
    if (context.undefinedMap[targetId]) {
      context.undefinedSizeCount.value--
    }
    context.undefinedMap[targetId] = undefined
  }

  function syncUndefinedState(targetId: string | number, active: boolean) {
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

  function computeSize(targetId: string | number) {
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

  function onResize(targetId: string | number, width: number, height: number) {
    if (id.value === targetId) {
      applyWidthHeight(width, height)
    }
  }

  watch(() => toValue(options).watchData, () => {
    updateWatchData()
  })

  if (!context.resizeObserver) {
    watch(() => toValue(options).sizeDependencies, () => {
      onDataUpdate()
    }, {
      deep: true,
    })
  }

  watch(id, (value, oldValue) => {
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
  })

  watch(finalActive, (value) => {
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
  })

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

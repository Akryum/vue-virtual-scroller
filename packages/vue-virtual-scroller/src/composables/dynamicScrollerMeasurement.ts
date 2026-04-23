import type { ComputedRef, MaybeRefOrGetter } from 'vue'
import type { KeyValue, ScrollDirection, VScrollData } from '../types'
import type { DynamicScrollerMeasureQueue } from './dynamicScrollerMeasureQueue'
import { computed, toValue, watch } from 'vue'
import { resolveItemKeyWithOptionalIndex } from '../engine/keyField'

export interface DynamicScrollerUpdatePayload {
  force: boolean
}

export interface DynamicScrollerMeasurementContext {
  vscrollData: VScrollData
  resizeObserver: ResizeObserver | undefined
  measureQueue: DynamicScrollerMeasureQueue
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
  /**
   * @deprecated `sizeDependencies` is a legacy fallback for environments without
   * `ResizeObserver` and will be removed in the next major release.
   */
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

const SIZE_DEPENDENCIES_DEPRECATION_MESSAGE = '[vue-virtual-scroller] `sizeDependencies` is deprecated and will be removed in the next major release. Dynamic item sizing uses ResizeObserver in modern browsers.'
const SHOULD_WARN_ABOUT_SIZE_DEPENDENCIES = import.meta.env.MODE !== 'test'
let hasWarnedAboutSizeDependenciesDeprecation = false

function warnDeprecatedSizeDependencies(value: DynamicScrollerItemControllerOptions['sizeDependencies']) {
  if (!SHOULD_WARN_ABOUT_SIZE_DEPENDENCIES || value == null || hasWarnedAboutSizeDependenciesDeprecation) {
    return
  }

  hasWarnedAboutSizeDependenciesDeprecation = true
  console.warn(SIZE_DEPENDENCIES_DEPRECATION_MESSAGE)
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
    return resolveItemKeyWithOptionalIndex(opts.item, opts.index, context.vscrollData.keyField)
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
    context.measureQueue.schedule(targetId, {
      read() {
        if (id.value !== targetId) {
          return null
        }

        const elValue = toValue(el)
        if (!elValue) {
          return null
        }

        return {
          width: elValue.offsetWidth,
          height: elValue.offsetHeight,
        }
      },
      write(value) {
        const { width, height } = value as { width: number, height: number }
        applyWidthHeight(width, height)
      },
      done() {
        _pendingSizeUpdate = null
      },
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

  warnDeprecatedSizeDependencies(toValue(options).sizeDependencies)

  _cleanupStops.push(watch(() => toValue(options).watchData, () => {
    updateWatchData()
  }))

  _cleanupStops.push(watch(() => toValue(options).sizeDependencies, (value) => {
    warnDeprecatedSizeDependencies(value)

    if (!context.resizeObserver) {
      onDataUpdate()
    }
  }, {
    deep: true,
  }))

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
    context.measureQueue.cancel(id.value)
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

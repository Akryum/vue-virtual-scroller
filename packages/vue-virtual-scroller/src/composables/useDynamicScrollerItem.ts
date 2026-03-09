import { type ComputedRef, type MaybeRef, type MaybeRefOrGetter, computed, inject, nextTick, onBeforeUnmount, onMounted, toValue, watch } from 'vue'
import type { VScrollData } from '../types'

export interface UseDynamicScrollerItemOptions {
  item: unknown
  watchData: boolean
  active: boolean
  index?: number
  sizeDependencies?: Record<string, unknown> | unknown[] | null
  emitResize: boolean
}

export interface UseDynamicScrollerItemReturn {
  id: ComputedRef<string | number>
  size: ComputedRef<number>
  finalActive: ComputedRef<boolean>
  updateSize: () => void
}

export function useDynamicScrollerItem(
  options: MaybeRefOrGetter<UseDynamicScrollerItemOptions>,
  el: MaybeRef<HTMLElement | undefined>,
  callbacks?: {
    onResize?: (id: string | number) => void
  },
): UseDynamicScrollerItemReturn {
  const vscrollData = inject<VScrollData>('vscrollData')!
  const vscrollParent = inject<any>('vscrollParent')!
  const vscrollResizeObserver = inject<ResizeObserver | undefined>('vscrollResizeObserver')

  // Internal state
  let _forceNextVScrollUpdate: string | number | null = null
  let _pendingSizeUpdate: string | number | null = null
  let _pendingVScrollUpdate: string | number | null = null
  let _sizeObserved = false
  let _watchDataStop: (() => void) | null = null

  // Computed
  const id = computed<string | number>(() => {
    const opts = toValue(options)
    if (vscrollData.simpleArray) return opts.index!
    if (vscrollData.keyField in (opts.item as any)) return (opts.item as any)[vscrollData.keyField]
    throw new Error(`keyField '${vscrollData.keyField}' not found in your item. You should set a valid keyField prop on your Scroller`)
  })

  const size = computed(() => {
    return vscrollData.sizes[id.value] || 0
  })

  const finalActive = computed(() => {
    return toValue(options).active && vscrollData.active
  })

  // Methods
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
    if (opts.watchData && !vscrollResizeObserver) {
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

  function onVscrollUpdate({ force }: { force: boolean }) {
    // If not active, schedule a size update when it becomes active
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

  function computeSize(targetId: string | number) {
    nextTick(() => {
      if (id.value === targetId) {
        const elValue = toValue(el)
        if (!elValue) return
        const width = elValue.offsetWidth
        const height = elValue.offsetHeight
        applyWidthHeight(width, height)
      }
      _pendingSizeUpdate = null
    })
  }

  function applyWidthHeight(width: number, height: number) {
    const direction = typeof vscrollParent.direction === 'object'
      ? (vscrollParent.direction as ComputedRef<string>).value
      : vscrollParent.direction
    const sizeValue = ~~(direction === 'vertical' ? height : width)
    if (sizeValue && size.value !== sizeValue) {
      applySize(sizeValue)
    }
  }

  function applySize(sizeValue: number) {
    if (vscrollParent.$_undefinedMap[id.value]) {
      vscrollParent.$_undefinedSizes--
      vscrollParent.$_undefinedMap[id.value] = undefined
    }
    vscrollData.sizes[id.value] = sizeValue
    if (toValue(options).emitResize) callbacks?.onResize?.(id.value)
  }

  function observeSize() {
    if (!vscrollResizeObserver) return
    if (_sizeObserved) return
    const elValue = toValue(el)
    if (!elValue) return
    vscrollResizeObserver.observe(elValue)
    ;(elValue as any).$_vs_id = id.value
    ;(elValue as any).$_vs_onResize = onResize
    _sizeObserved = true
  }

  function unobserveSize() {
    if (!vscrollResizeObserver) return
    if (!_sizeObserved) return
    const elValue = toValue(el)
    if (!elValue) return
    vscrollResizeObserver.unobserve(elValue)
    ;(elValue as any).$_vs_onResize = undefined
    _sizeObserved = false
  }

  function onResize(targetId: string | number, width: number, height: number) {
    if (id.value === targetId) {
      applyWidthHeight(width, height)
    }
  }

  // Watchers
  watch(() => toValue(options).watchData, () => {
    updateWatchData()
  })

  watch(id, (value, oldValue) => {
    const elValue = toValue(el)
    if (elValue) {
      ;(elValue as any).$_vs_id = id.value
    }
    if (!size.value) {
      onDataUpdate()
    }

    if (_sizeObserved) {
      // In case the old item had the same size, it won't trigger the ResizeObserver
      // since we are reusing the same DOM node
      const oldSize = vscrollData.sizes[oldValue]
      const newSize = vscrollData.sizes[value]

      if (newSize != null && newSize !== oldSize) {
        applySize(newSize)
      }
      else if (oldSize != null && oldSize !== newSize) {
        applySize(oldSize)
      }
    }
  })

  watch(finalActive, (value) => {
    if (!size.value) {
      if (value) {
        if (!vscrollParent.$_undefinedMap[id.value]) {
          vscrollParent.$_undefinedSizes++
          vscrollParent.$_undefinedMap[id.value] = true
        }
      }
      else {
        if (vscrollParent.$_undefinedMap[id.value]) {
          vscrollParent.$_undefinedSizes--
          vscrollParent.$_undefinedMap[id.value] = false
        }
      }
    }

    if (vscrollResizeObserver) {
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

  // Created logic
  updateWatchData()

  if (!vscrollResizeObserver) {
    const opts = toValue(options)
    if (opts.sizeDependencies) {
      for (const k in opts.sizeDependencies) {
        watch(() => (toValue(options).sizeDependencies as any)[k], onDataUpdate)
      }
    }

    vscrollParent.$_events.on('vscroll:update', onVscrollUpdate)
  }

  // Lifecycle
  onMounted(() => {
    if (finalActive.value) {
      updateSize()
      observeSize()
    }
  })

  onBeforeUnmount(() => {
    vscrollParent.$_events.off('vscroll:update', onVscrollUpdate)
    unobserveSize()
  })

  return {
    id,
    size,
    finalActive,
    updateSize,
  }
}

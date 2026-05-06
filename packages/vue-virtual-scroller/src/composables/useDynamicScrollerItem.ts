import type { MaybeRefOrGetter } from 'vue'
import type { KeyValue } from '../types'
import type { DynamicScrollerItemControllerOptions, DynamicScrollerMeasurementContext } from './dynamicScrollerMeasurement'
import type { ScrollerOptionEnabled } from './scrollerOptions'
import { computed, inject, onBeforeUnmount, onMounted, toValue, watch } from 'vue'
import { createDynamicScrollerItemController } from './dynamicScrollerMeasurement'

export interface UseDynamicScrollerItemOptions<TItem = unknown> extends DynamicScrollerItemControllerOptions<TItem>, ScrollerOptionEnabled {
  el: MaybeRefOrGetter<HTMLElement | undefined>
  onResize?: (id: KeyValue) => void
}

export interface UseDynamicScrollerItemLegacyOptions<TItem = unknown> extends DynamicScrollerItemControllerOptions<TItem>, ScrollerOptionEnabled {}

export interface UseDynamicScrollerItemReturn {
  id: ReturnType<typeof createDynamicScrollerItemController>['id']
  size: ReturnType<typeof createDynamicScrollerItemController>['size']
  finalActive: ReturnType<typeof createDynamicScrollerItemController>['finalActive']
  updateSize: ReturnType<typeof createDynamicScrollerItemController>['updateSize']
}

export function useDynamicScrollerItem<TItem>(
  options: MaybeRefOrGetter<UseDynamicScrollerItemOptions<TItem>>,
): UseDynamicScrollerItemReturn
export function useDynamicScrollerItem<TItem>(
  options: MaybeRefOrGetter<UseDynamicScrollerItemLegacyOptions<TItem>>,
  el: MaybeRefOrGetter<HTMLElement | undefined>,
  callbacks?: {
    onResize?: (id: KeyValue) => void
  },
): UseDynamicScrollerItemReturn
export function useDynamicScrollerItem<TItem>(
  options: MaybeRefOrGetter<UseDynamicScrollerItemOptions<TItem> | UseDynamicScrollerItemLegacyOptions<TItem>>,
  el?: MaybeRefOrGetter<HTMLElement | undefined>,
  callbacks?: {
    onResize?: (id: KeyValue) => void
  },
): UseDynamicScrollerItemReturn {
  const measurementContext = inject<DynamicScrollerMeasurementContext>('vscrollMeasurementContext')!
  const anchorRegistry = inject<{
    delete: (el: HTMLElement) => void
    set: (el: HTMLElement, value: { active: boolean, id: KeyValue }) => void
  } | null>('vscrollAnchorRegistry', null)
  const resolvedEl = computed(() => {
    const optionEl = (toValue(options) as Partial<UseDynamicScrollerItemOptions<TItem>>).el
    return toValue(el ?? optionEl)
  })
  const resolvedCallbacks = {
    onResize: (id: KeyValue) => (callbacks?.onResize ?? (toValue(options) as Partial<UseDynamicScrollerItemOptions<TItem>>).onResize)?.(id),
  }
  /**
   * Resolve the `enabled` flag (defaults to `true` when omitted). When `false`
   * the controller is never mounted: no resize observation, no measurement,
   * no anchor registration. Toggling back to `true` re-arms it.
   */
  const isEnabled = computed(() => toValue(
    (toValue(options) as Partial<UseDynamicScrollerItemOptions<TItem>>).enabled ?? true,
  ))
  const controller = createDynamicScrollerItemController(options, resolvedEl, measurementContext, resolvedCallbacks)

  let mounted = false

  function mountController() {
    if (mounted) {
      return
    }
    controller.mount()
    mounted = true
  }

  function unmountController() {
    if (!mounted) {
      return
    }
    controller.unmount()
    mounted = false
  }

  onMounted(() => {
    if (!isEnabled.value) {
      return
    }
    mountController()
  })

  watch(isEnabled, (enabled) => {
    if (enabled) {
      mountController()
    }
    else {
      const elValue = resolvedEl.value
      if (anchorRegistry && elValue) {
        anchorRegistry.delete(elValue as HTMLElement)
      }
      unmountController()
    }
  })

  if (anchorRegistry) {
    watch(
      [controller.id, controller.finalActive, resolvedEl, isEnabled],
      ([id, active, elValue, enabled], [_oldId, _oldActive, oldElValue]) => {
        if (oldElValue && oldElValue !== elValue) {
          anchorRegistry.delete(oldElValue as HTMLElement)
        }

        if (!enabled) {
          return
        }

        if (elValue) {
          anchorRegistry.set(elValue as HTMLElement, {
            active,
            id,
          })
        }
      },
      {
        immediate: true,
      },
    )
  }

  onBeforeUnmount(() => {
    const elValue = resolvedEl.value
    if (anchorRegistry && elValue) {
      anchorRegistry.delete(elValue as HTMLElement)
    }
    unmountController()
  })

  return {
    id: controller.id,
    size: controller.size,
    finalActive: controller.finalActive,
    updateSize: controller.updateSize,
  }
}

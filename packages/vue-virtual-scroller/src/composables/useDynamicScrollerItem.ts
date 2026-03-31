import type { MaybeRef, MaybeRefOrGetter } from 'vue'
import type { KeyValue } from '../types'
import type { DynamicScrollerItemControllerOptions, DynamicScrollerMeasurementContext } from './dynamicScrollerMeasurement'
import { inject, onBeforeUnmount, onMounted, toValue, watch } from 'vue'
import { createDynamicScrollerItemController } from './dynamicScrollerMeasurement'

export interface UseDynamicScrollerItemOptions<TItem = unknown> extends DynamicScrollerItemControllerOptions<TItem> {}

export interface UseDynamicScrollerItemReturn {
  id: ReturnType<typeof createDynamicScrollerItemController>['id']
  size: ReturnType<typeof createDynamicScrollerItemController>['size']
  finalActive: ReturnType<typeof createDynamicScrollerItemController>['finalActive']
  updateSize: ReturnType<typeof createDynamicScrollerItemController>['updateSize']
}

export function useDynamicScrollerItem<TItem>(
  options: MaybeRefOrGetter<UseDynamicScrollerItemOptions<TItem>>,
  el: MaybeRef<HTMLElement | undefined>,
  callbacks?: {
    onResize?: (id: KeyValue) => void
  },
): UseDynamicScrollerItemReturn {
  const measurementContext = inject<DynamicScrollerMeasurementContext>('vscrollMeasurementContext')!
  const anchorRegistry = inject<{
    delete: (el: HTMLElement) => void
    set: (el: HTMLElement, value: { active: boolean, id: KeyValue }) => void
  } | null>('vscrollAnchorRegistry', null)
  const controller = createDynamicScrollerItemController(
    options,
    el,
    measurementContext,
    callbacks,
  )

  onMounted(() => {
    controller.mount()
  })

  if (anchorRegistry) {
    watch(
      [controller.id, controller.finalActive, () => toValue(el)],
      ([id, active, elValue], [_oldId, _oldActive, oldElValue]) => {
        if (oldElValue && oldElValue !== elValue) {
          anchorRegistry.delete(oldElValue as HTMLElement)
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
    const elValue = toValue(el)
    if (anchorRegistry && elValue) {
      anchorRegistry.delete(elValue as HTMLElement)
    }
    controller.unmount()
  })

  return {
    id: controller.id,
    size: controller.size,
    finalActive: controller.finalActive,
    updateSize: controller.updateSize,
  }
}

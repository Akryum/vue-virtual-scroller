import type { MaybeRef, MaybeRefOrGetter } from 'vue'
import type { DynamicScrollerItemControllerOptions, DynamicScrollerMeasurementContext } from './dynamicScrollerMeasurement'
import { inject, onBeforeUnmount, onMounted } from 'vue'
import { createDynamicScrollerItemController } from './dynamicScrollerMeasurement'

export interface UseDynamicScrollerItemOptions extends DynamicScrollerItemControllerOptions {}

export type UseDynamicScrollerItemReturn = ReturnType<typeof createDynamicScrollerItemController> extends infer T
  ? Pick<T & object, 'id' | 'size' | 'finalActive' | 'updateSize'>
  : never

export function useDynamicScrollerItem(
  options: MaybeRefOrGetter<UseDynamicScrollerItemOptions>,
  el: MaybeRef<HTMLElement | undefined>,
  callbacks?: {
    onResize?: (id: string | number) => void
  },
): UseDynamicScrollerItemReturn {
  const measurementContext = inject<DynamicScrollerMeasurementContext>('vscrollMeasurementContext')!
  const controller = createDynamicScrollerItemController(
    options,
    el,
    measurementContext,
    callbacks,
  )

  onMounted(() => {
    controller.mount()
  })

  onBeforeUnmount(() => {
    controller.unmount()
  })

  return {
    id: controller.id,
    size: controller.size,
    finalActive: controller.finalActive,
    updateSize: controller.updateSize,
  }
}

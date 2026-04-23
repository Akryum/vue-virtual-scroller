<script setup lang="ts" generic="TItem">
import type { KeyValue } from '../types'
import { ref } from 'vue'
import { useDynamicScrollerItem } from '../composables/useDynamicScrollerItem'

const props = withDefaults(defineProps<{
  item: TItem
  watchData?: boolean
  active: boolean
  index?: number
  /**
   * @deprecated `sizeDependencies` is a legacy fallback for environments without
   * `ResizeObserver` and will be removed in the next major release.
   */
  sizeDependencies?: Record<string, unknown> | unknown[] | null
  emitResize?: boolean
  tag?: string
}>(), {
  watchData: false,
  index: undefined,
  sizeDependencies: null,
  emitResize: false,
  tag: 'div',
})

const emit = defineEmits<{
  resize: [id: KeyValue]
}>()

defineSlots<{
  default?: () => unknown
}>()

const el = ref<HTMLElement>()

useDynamicScrollerItem(
  props,
  el,
  {
    onResize: id => emit('resize', id),
  },
)
</script>

<template>
  <component
    :is="props.tag"
    ref="el"
  >
    <slot />
  </component>
</template>

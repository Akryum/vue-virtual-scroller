<script setup lang="ts">
import { ref } from 'vue'
import { useDynamicScrollerItem } from '../composables/useDynamicScrollerItem'

const props = withDefaults(defineProps<{
  item: unknown
  watchData?: boolean
  active: boolean
  index?: number
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
  resize: [id: string | number]
}>()

defineSlots()

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

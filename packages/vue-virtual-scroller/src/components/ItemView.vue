<!-- Avoid re-renders of slots -->

<script setup lang="ts" generic="TItem, TKey">
import type { RecycleScrollerSlotProps, View } from '../types'

const props = defineProps<{
  view: View<TItem, TKey>
  itemTag: string
}>()

defineSlots<{
  default?: (props: RecycleScrollerSlotProps<TItem>) => unknown
}>()
</script>

<template>
  <component
    :is="props.itemTag"
    class="vue-recycle-scroller__item-view"
  >
    <slot
      :item="props.view.item"
      :index="props.view.nr.index"
      :active="props.view.nr.used"
    />
  </component>
</template>

<!-- Avoid re-renders of slots -->

<script setup lang="ts">
import type { View } from '../types'

const props = defineProps<{
  view: View
  itemTag: string
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

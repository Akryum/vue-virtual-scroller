---
aside: false
outline: false
---

<script setup>
import FunctionItemSizeDocDemo from '../.vitepress/components/demos/FunctionItemSizeDocDemo.vue'
</script>

# Function `itemSize` Demo

This demo shows `RecycleScroller` using `itemSize` as a function getter instead of a fixed number or `sizeField`.

## Try it yourself

- Toggle `Use function getter` to switch between resolver-based sizing and `sizeField`.
- Toggle `Compact density` to make row height depend on external UI state.
- Jump to a specific row to confirm scrolling still lands on derived-size items.

<FunctionItemSizeDocDemo />

## Source code

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import { RecycleScroller } from 'vue-virtual-scroller'

interface Row {
  id: number
  message: string
  priority: 'normal' | 'vip' | 'alert'
  resolvedHeight: number
}

const compact = ref(false)
const useFunctionGetter = ref(true)
const rows = ref<Row[]>([])

function resolveItemHeight(item: Pick<Row, 'message' | 'priority'>, index: number) {
  const previewLines = Math.max(1, Math.ceil(item.message.length / 72))
  const densityBase = compact.value ? 54 : 72
  const priorityBoost = item.priority === 'alert' ? 20 : item.priority === 'vip' ? 10 : 0
  const parityBoost = index % 3 === 0 ? 6 : 0
  return densityBase + (previewLines * 18) + priorityBoost + parityBoost
}

const itemSize = computed(() => (useFunctionGetter.value
  ? (item: Row, index: number) => resolveItemHeight(item, index)
  : null))
</script>

<template>
  <RecycleScroller
    :items="rows"
    :item-size="itemSize"
    key-field="id"
    size-field="resolvedHeight"
  >
    <template #default="{ item }">
      <article :style="{ height: `${item.resolvedHeight}px` }">
        Chosen row height: {{ item.resolvedHeight }}px
      </article>
    </template>
  </RecycleScroller>
</template>
```

<script setup>
import HorizontalDocDemo from '../.vitepress/components/demos/HorizontalDocDemo.vue'
</script>

# Horizontal Demo

Use this demo for horizontally scrolling lists with dynamic item width.

What to try:

- Scroll horizontally with trackpad or Shift + mouse wheel.
- Filter cards and verify smooth reflow.
- Inspect how variable-width content stays virtualized.

<HorizontalDocDemo />


## Relevant source code

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import { createMessages } from '../.vitepress/components/demos/demo-data'

const search = ref('')
const rows = ref(createMessages(500, 909))

const filteredRows = computed(() => {
  const term = search.value.trim().toLowerCase()
  if (!term)
    return rows.value
  return rows.value.filter(row => row.message.toLowerCase().includes(term) || row.user.toLowerCase().includes(term))
})

function cardWidth(message: string) {
  return Math.max(180, Math.min(440, Math.round(message.length * 0.95)))
}
</script>

<template>
  <DynamicScroller
    :items="filteredRows"
    :min-item-size="180"
    direction="horizontal"
  >
    <template #default="{ item, active }">
      <DynamicScrollerItem
        :item="item"
        :active="active"
        :size-dependencies="[item.message]"
        :style="{ width: `${cardWidth(item.message)}px` }"
      >
        {{ item.message }}
      </DynamicScrollerItem>
    </template>
  </DynamicScroller>
</template>
```

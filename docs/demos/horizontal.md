<script setup>
import HorizontalDocDemo from '../.vitepress/components/demos/HorizontalDocDemo.vue'
</script>

# Horizontal Demo

This demo shows a horizontal list where card width is measured from the rendered content. It is useful when item width varies and the list still needs to stay virtualized.

## Try it yourself

- Scroll horizontally with a trackpad or with `Shift` plus the mouse wheel.
- Filter the cards and check that the list reflows smoothly.
- Compare short and long cards to see how variable widths are handled.

<HorizontalDocDemo />


## Source code

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

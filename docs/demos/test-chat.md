---
aside: false
outline: false
---

<script setup>
import TestChatDocDemo from '../.vitepress/components/demos/TestChatDocDemo.vue'
</script>

# Test Chat Demo

This demo is a compact stress test for append-heavy timelines. It is useful when you want to check how the list behaves during frequent burst updates.

## Try it yourself

- Add small and large batches of messages.
- Confirm that the list stays pinned to the bottom as new content arrives.
- Use it as a quick baseline when testing chat-style rendering.

<TestChatDocDemo />


## Source code

```vue
<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import { createSimpleStrings } from '../.vitepress/components/demos/demo-data'

const pool = createSimpleStrings(1200, 1303)
const scroller = useTemplateRef<InstanceType<typeof DynamicScroller>>('scroller')
const rows = ref<{ id: number, text: string }[]>([])

let nextId = 1

function addItems(count = 1) {
  const appendedRows: Array<{ id: number, text: string }> = []
  for (let i = 0; i < count; i++) {
    appendedRows.push({
      id: nextId,
      text: pool[nextId % pool.length],
    })
    nextId++
  }
  rows.value = [...rows.value, ...appendedRows]
  requestAnimationFrame(() => scroller.value?.scrollToBottom())
}
</script>

<template>
  <DynamicScroller
    ref="scroller"
    :key="rows.length"
    :items="rows"
    :min-item-size="48"
    @resize="scroller?.scrollToBottom()"
  >
    <template #default="{ item, active }">
      <DynamicScrollerItem
        :item="item"
        :active="active"
      >
        {{ item.text }}
      </DynamicScrollerItem>
    </template>
  </DynamicScroller>
</template>
```

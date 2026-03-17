<script setup>
import TestChatDocDemo from '../.vitepress/components/demos/TestChatDocDemo.vue'
</script>

# Test Chat Demo

Use this demo to test append-heavy timelines and quick burst updates.

What to try:

- Add rows in different batch sizes (`+1`, `+5`, `+20`, `+80`).
- Confirm auto-scroll behavior under repeated inserts.
- Use it as a sanity check for real-time message UIs.

<TestChatDocDemo />


## Relevant source code

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import { createSimpleStrings } from '../.vitepress/components/demos/demo-data'

const pool = createSimpleStrings(1200, 1303)
const scroller = ref<InstanceType<typeof DynamicScroller>>()
const rows = ref<{ id: number, text: string }[]>([])

let nextId = 1

function addItems(count = 1) {
  for (let i = 0; i < count; i++) {
    rows.value.push({
      id: nextId,
      text: pool[nextId % pool.length],
    })
    nextId++
  }
  requestAnimationFrame(() => scroller.value?.scrollToBottom())
}
</script>

<template>
  <DynamicScroller
    ref="scroller"
    :items="rows"
    :min-item-size="48"
    @resize="scroller?.scrollToBottom()"
  >
    <template #default="{ item, active }">
      <DynamicScrollerItem
        :item="item"
        :active="active"
        :size-dependencies="[item.text]"
      >
        {{ item.text }}
      </DynamicScrollerItem>
    </template>
  </DynamicScroller>
</template>
```

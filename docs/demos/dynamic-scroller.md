<script setup>
import DynamicScrollerDocDemo from '../.vitepress/components/demos/DynamicScrollerDocDemo.vue'
</script>

# DynamicScroller Demo

Use this demo when item height is not known ahead of time.

What to try:

- Filter the list to verify virtualization still behaves correctly.
- Click messages to mutate content and trigger automatic re-measurement.
- Adjust `Min row size` to see first-render tradeoffs.
- Watch the visible range to understand viewport updates.

<DynamicScrollerDocDemo />


## Relevant source code

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import { createMessages, mutateMessage } from '../.vitepress/components/demos/demo-data'

const search = ref('')
const messages = ref(createMessages(600, 101))
const minItemSize = ref(68)

const filteredMessages = computed(() => {
  const term = search.value.trim().toLowerCase()
  if (!term)
    return messages.value
  return messages.value.filter(item => item.message.toLowerCase().includes(term) || item.user.toLowerCase().includes(term))
})

function randomizeMessage(index: number) {
  const row = filteredMessages.value[index]
  if (!row)
    return
  mutateMessage(row, Date.now() % 997)
}
</script>

<template>
  <DynamicScroller
    :items="filteredMessages"
    :min-item-size="minItemSize"
  >
    <template #default="{ item, index, active }">
      <DynamicScrollerItem
        :item="item"
        :active="active"
        :size-dependencies="[item.message]"
        @click="randomizeMessage(index)"
      >
        <strong>{{ item.user }}</strong>
        <p>{{ item.message }}</p>
      </DynamicScrollerItem>
    </template>
  </DynamicScroller>
</template>
```

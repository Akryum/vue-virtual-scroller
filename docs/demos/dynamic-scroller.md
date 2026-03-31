<script setup>
import DynamicScrollerDocDemo from '../.vitepress/components/demos/DynamicScrollerDocDemo.vue'
</script>

# DynamicScroller Demo

This demo focuses on the case where row height is not known until the content is rendered. It is a practical example of when to reach for `DynamicScroller`.

## Try it yourself

- Filter the list to confirm virtualization still tracks the right rows.
- Click messages to change their content and trigger a fresh measurement.
- Adjust the minimum row size to see how the initial estimate affects the first render.
- Watch the visible range to understand how the viewport is updated as you scroll.

<DynamicScrollerDocDemo />


## Source code

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

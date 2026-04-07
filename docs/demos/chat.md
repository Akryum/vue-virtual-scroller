<script setup>
import ChatStreamDocDemo from '../.vitepress/components/demos/ChatStreamDocDemo.vue'
</script>

# Chat Stream Demo

This demo shows a typical append-only stream such as chat, logs, or live activity feeds. New rows are added continuously while the view stays focused on the latest content.

## Try it yourself

- Start and stop the stream to see how the list behaves during continuous updates.
- Add a larger batch of messages to check how quickly the view catches up.
- Apply a filter while data is still growing.
- Confirm that the list stays near the latest messages instead of drifting upward.

<ChatStreamDocDemo />


## Source code

```vue
<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useTemplateRef } from 'vue'
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import { createMessages } from '../.vitepress/components/demos/demo-data'

const scroller = useTemplateRef<InstanceType<typeof DynamicScroller>>('scroller')
const basePool = createMessages(1500, 303)

let nextId = 1
const stream = ref(createMessages(20, 707).map(item => ({ ...item, id: nextId++ })))
const search = ref('')
const streaming = ref(false)

let streamTimer: ReturnType<typeof setInterval> | undefined

const filteredItems = computed(() => {
  const term = search.value.trim().toLowerCase()
  if (!term)
    return stream.value
  return stream.value.filter(item => item.message.toLowerCase().includes(term) || item.user.toLowerCase().includes(term))
})

function appendBatch(amount = 8) {
  for (let i = 0; i < amount; i++) {
    const template = basePool[(nextId + i) % basePool.length]
    stream.value.push({
      ...template,
      id: nextId++,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    })
  }
  requestAnimationFrame(() => scroller.value?.scrollToBottom())
}

function startStream() {
  if (streaming.value)
    return
  streaming.value = true
  appendBatch(12)
  streamTimer = setInterval(() => {
    appendBatch(6)
  }, 320)
}

function stopStream() {
  streaming.value = false
  if (streamTimer) {
    clearInterval(streamTimer)
    streamTimer = undefined
  }
}

onBeforeUnmount(stopStream)
</script>

<template>
  <DynamicScroller
    ref="scroller"
    :items="filteredItems"
    :min-item-size="62"
  >
    <template #default="{ item, active }">
      <DynamicScrollerItem
        :item="item"
        :active="active"
        :size-dependencies="[item.message]"
      >
        <strong>{{ item.user }}</strong>
        <p>{{ item.message }}</p>
      </DynamicScrollerItem>
    </template>
  </DynamicScroller>
</template>
```

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import DynamicScroller from '../../../../packages/vue-virtual-scroller/src/components/DynamicScroller.vue'
import DynamicScrollerItem from '../../../../packages/vue-virtual-scroller/src/components/DynamicScrollerItem.vue'
import { avatarStyle, createMessages } from './demo-data'
import DemoShell from './DemoShell.vue'

const scroller = ref<InstanceType<typeof DynamicScroller>>()
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
  <DemoShell
    title="Chat stream"
    description="Continuously appends new rows while keeping the view pinned to the latest messages."
  >
    <template #toolbar>
      <button
        v-if="!streaming"
        class="demo-button"
        @click="startStream"
      >
        Start stream
      </button>
      <button
        v-else
        class="demo-button secondary"
        @click="stopStream"
      >
        Stop stream
      </button>

      <button
        class="demo-button secondary"
        @click="appendBatch(20)"
      >
        +20 messages
      </button>

      <label class="demo-chip">
        Filter
        <input
          v-model="search"
          type="text"
          placeholder="Search"
        >
      </label>

      <span class="demo-chip">Rows: {{ filteredItems.length }}</span>
    </template>

    <DynamicScroller
      ref="scroller"
      class="demo-viewport"
      :items="filteredItems"
      :min-item-size="62"
    >
      <template #default="{ item, index, active }">
        <DynamicScrollerItem
          :item="item"
          :active="active"
          :size-dependencies="[item.message]"
          class="demo-message-row"
        >
          <div
            class="demo-avatar"
            :style="avatarStyle(item.hue)"
          >
            {{ item.initials }}
          </div>

          <div class="demo-chat-bubble">
            <strong>{{ item.user }}</strong>
            <div class="demo-message-body">
              {{ item.message }}
            </div>
          </div>

          <small class="demo-message-meta">#{{ index }} · {{ item.timestamp }}</small>
        </DynamicScrollerItem>
      </template>
    </DynamicScroller>
  </DemoShell>
</template>

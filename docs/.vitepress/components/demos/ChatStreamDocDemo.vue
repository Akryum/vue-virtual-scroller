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
    demo-id="chat"
    title="Live chat stream"
    description="Appends incoming messages while keeping the latest content in view."
  >
    <template #toolbar>
      <button
        v-if="!streaming"
        class="demo-button"
        data-testid="demo:control:start-stream"
        @click="startStream"
      >
        Start streaming
      </button>
      <button
        v-else
        class="demo-button secondary"
        data-testid="demo:control:stop-stream"
        @click="stopStream"
      >
        Stop streaming
      </button>

      <button
        class="demo-button secondary"
        data-testid="demo:control:append-20"
        @click="appendBatch(20)"
      >
        Add 20 messages
      </button>

      <label class="demo-chip">
        Filter
        <input
          v-model="search"
          data-testid="demo:control:filter"
          type="text"
          placeholder="Search messages"
        >
      </label>

      <span
        class="demo-chip"
        data-testid="demo:metric:rows"
      >Visible rows: {{ filteredItems.length }}</span>
    </template>

    <DynamicScroller
      ref="scroller"
      class="demo-viewport"
      data-testid="demo:viewport"
      :items="filteredItems"
      :min-item-size="62"
    >
      <template #default="{ item, index, active }">
        <DynamicScrollerItem
          :item="item"
          :active="active"
          :size-dependencies="[item.message]"
          class="demo-message-row"
          data-testid="demo:row"
          :data-row-id="String(item.id)"
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

          <small
            class="demo-message-meta"
            data-testid="demo:row-meta"
          >#{{ index }} · {{ item.timestamp }}</small>
        </DynamicScrollerItem>
      </template>
    </DynamicScroller>
  </DemoShell>
</template>

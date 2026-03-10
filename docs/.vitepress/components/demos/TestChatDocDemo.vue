<script setup lang="ts">
import { ref } from 'vue'
import DynamicScroller from '../../../../packages/vue-virtual-scroller/src/components/DynamicScroller.vue'
import DynamicScrollerItem from '../../../../packages/vue-virtual-scroller/src/components/DynamicScrollerItem.vue'
import { createSimpleStrings } from './demo-data'
import DemoShell from './DemoShell.vue'

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
  <DemoShell
    title="Test chat append"
    description="Ported from test-chat. This stress test appends many rows and keeps the viewport pinned to the latest messages."
  >
    <template #toolbar>
      <button class="demo-button" @click="addItems(1)">
        +1
      </button>
      <button class="demo-button" @click="addItems(5)">
        +5
      </button>
      <button class="demo-button" @click="addItems(20)">
        +20
      </button>
      <button class="demo-button" @click="addItems(80)">
        +80
      </button>
      <span class="demo-chip">Messages: {{ rows.length }}</span>
    </template>

    <DynamicScroller
      ref="scroller"
      class="demo-viewport"
      :items="rows"
      :min-item-size="48"
      @resize="scroller?.scrollToBottom()"
    >
      <template #default="{ item, index, active }">
        <DynamicScrollerItem
          :item="item"
          :active="active"
          :size-dependencies="[item.text]"
          class="demo-message-row"
        >
          <div class="demo-avatar" :style="{ background: 'linear-gradient(145deg, #2f7a52, #14532d)' }">
            {{ String((index % 99) + 1).padStart(2, '0') }}
          </div>
          <div class="demo-chat-bubble">
            <div class="demo-message-body">
              {{ item.text }}
            </div>
          </div>
          <small class="demo-message-meta">#{{ item.id }}</small>
        </DynamicScrollerItem>
      </template>
    </DynamicScroller>
  </DemoShell>
</template>

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
    demo-id="test-chat"
    title="Append-heavy timeline"
    description="A compact stress test for burst inserts and bottom pinning."
  >
    <template #toolbar>
      <button
        class="demo-button"
        data-testid="demo:control:add-1"
        @click="addItems(1)"
      >
        Add 1
      </button>
      <button
        class="demo-button"
        data-testid="demo:control:add-5"
        @click="addItems(5)"
      >
        Add 5
      </button>
      <button
        class="demo-button"
        data-testid="demo:control:add-20"
        @click="addItems(20)"
      >
        Add 20
      </button>
      <button
        class="demo-button"
        data-testid="demo:control:add-80"
        @click="addItems(80)"
      >
        Add 80
      </button>
      <span
        class="demo-chip"
        data-testid="demo:metric:messages"
      >Total messages: {{ rows.length }}</span>
    </template>

    <DynamicScroller
      ref="scroller"
      class="demo-viewport"
      data-testid="demo:viewport"
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
          data-testid="demo:row"
          :data-row-id="String(item.id)"
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

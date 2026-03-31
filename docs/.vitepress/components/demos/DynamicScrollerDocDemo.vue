<script setup lang="ts">
import { computed, ref } from 'vue'
import DynamicScroller from '../../../../packages/vue-virtual-scroller/src/components/DynamicScroller.vue'
import DynamicScrollerItem from '../../../../packages/vue-virtual-scroller/src/components/DynamicScrollerItem.vue'
import { avatarStyle, createMessages, mutateMessage } from './demo-data'
import DemoShell from './DemoShell.vue'

const search = ref('')
const messages = ref(createMessages(600, 101))
const minItemSize = ref(68)

const visibleStart = ref(0)
const visibleEnd = ref(0)

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

function onUpdate(_viewStart: number, _viewEnd: number, start: number, end: number) {
  visibleStart.value = start
  visibleEnd.value = end
}
</script>

<template>
  <DemoShell
    demo-id="dynamic-scroller"
    title="DynamicScroller with measured rows"
    description="Measures row height after render and updates the layout as content changes."
  >
    <template #toolbar>
      <label class="demo-chip">
        Filter
        <input
          v-model="search"
          data-testid="demo:control:filter"
          type="text"
          placeholder="Search messages"
        >
      </label>

      <label class="demo-chip">
        Minimum row size
        <input
          v-model.number="minItemSize"
          data-testid="demo:control:min-row-size"
          type="range"
          min="40"
          max="120"
          step="2"
        >
        {{ minItemSize }}px
      </label>

      <span
        class="demo-chip"
        data-testid="demo:metric:matches"
      >Matching rows: {{ filteredMessages.length }}</span>
      <span
        class="demo-chip"
        data-testid="demo:metric:visible-range"
      >Visible rows: {{ visibleStart }}-{{ visibleEnd }}</span>
    </template>

    <DynamicScroller
      class="demo-viewport"
      data-testid="demo:viewport"
      :items="filteredMessages"
      :min-item-size="minItemSize"
      :emit-update="true"
      @update="onUpdate"
    >
      <template #default="{ item, index, active }">
        <DynamicScrollerItem
          :item="item"
          :active="active"
          :size-dependencies="[item.message]"
          class="demo-message-row"
          data-testid="demo:row"
          :data-row-id="String(item.id)"
          @click="randomizeMessage(index)"
        >
          <div
            class="demo-avatar"
            :style="avatarStyle(item.hue)"
          >
            {{ item.initials }}
          </div>

          <div>
            <div class="demo-message-body">
              {{ item.message }}
            </div>
            <small class="demo-message-meta">{{ item.user }}</small>
          </div>

          <small class="demo-message-meta">{{ item.timestamp }}</small>
        </DynamicScrollerItem>
      </template>
    </DynamicScroller>
  </DemoShell>
</template>

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
    title="DynamicScroller: unknown heights"
    description="Ported from the dynamic messages demo. Each row recalculates as content changes."
  >
    <template #toolbar>
      <label class="demo-chip">
        Filter
        <input
          v-model="search"
          type="text"
          placeholder="Type keyword"
        >
      </label>

      <label class="demo-chip">
        Min row size
        <input
          v-model.number="minItemSize"
          type="range"
          min="40"
          max="120"
          step="2"
        >
        {{ minItemSize }}px
      </label>

      <span class="demo-chip">Matches: {{ filteredMessages.length }}</span>
      <span class="demo-chip">Visible: {{ visibleStart }}-{{ visibleEnd }}</span>
    </template>

    <DynamicScroller
      class="demo-viewport"
      :items="filteredMessages"
      :min-item-size="minItemSize"
      :emit-update="true"
      @update="onUpdate"
    >
      <template #before>
        <div class="demo-notice">
          Click any message to mutate text and trigger a dynamic size recalculation.
        </div>
      </template>

      <template #default="{ item, index, active }">
        <DynamicScrollerItem
          :item="item"
          :active="active"
          :size-dependencies="[item.message]"
          class="demo-message-row"
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

      <template #after>
        <div class="demo-notice">
          End of list.
        </div>
      </template>
    </DynamicScroller>
  </DemoShell>
</template>

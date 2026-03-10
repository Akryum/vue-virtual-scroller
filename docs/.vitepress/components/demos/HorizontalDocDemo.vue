<script setup lang="ts">
import { computed, ref } from 'vue'
import DynamicScroller from '../../../../packages/vue-virtual-scroller/src/components/DynamicScroller.vue'
import DynamicScrollerItem from '../../../../packages/vue-virtual-scroller/src/components/DynamicScrollerItem.vue'
import { avatarStyle, createMessages } from './demo-data'
import DemoShell from './DemoShell.vue'

const search = ref('')
const rows = ref(createMessages(500, 909))

const filteredRows = computed(() => {
  const term = search.value.trim().toLowerCase()
  if (!term)
    return rows.value
  return rows.value.filter(row => row.message.toLowerCase().includes(term) || row.user.toLowerCase().includes(term))
})

function cardWidth(message: string) {
  return Math.max(180, Math.min(440, Math.round(message.length * 0.95)))
}
</script>

<template>
  <DemoShell
    title="Horizontal dynamic"
    description="Ported from the horizontal demo. Unknown widths are measured dynamically while scrolling on the x-axis."
  >
    <template #toolbar>
      <label class="demo-chip">
        Filter
        <input
          v-model="search"
          type="text"
          placeholder="Search text"
        >
      </label>

      <span class="demo-chip">Cards: {{ filteredRows.length }}</span>
      <span class="demo-chip">Tip: Shift + wheel for horizontal scroll</span>
    </template>

    <DynamicScroller
      class="demo-viewport demo-horizontal-track"
      :items="filteredRows"
      :min-item-size="180"
      direction="horizontal"
    >
      <template #before>
        <div class="demo-notice">
          Width is content-driven and recalculated per card.
        </div>
      </template>

      <template #default="{ item, index, active }">
        <DynamicScrollerItem
          :item="item"
          :active="active"
          :size-dependencies="[item.message]"
          :style="{ width: `${cardWidth(item.message)}px` }"
          class="demo-horizontal-card"
        >
          <div class="demo-avatar" :style="avatarStyle(item.hue)">
            {{ item.initials }}
          </div>
          <div class="demo-message-body">
            {{ item.message }}
          </div>
          <small class="demo-message-meta">{{ item.user }} · #{{ index }}</small>
        </DynamicScrollerItem>
      </template>
    </DynamicScroller>
  </DemoShell>
</template>

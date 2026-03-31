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
    demo-id="horizontal"
    title="Horizontal list"
    description="Measures card widths on demand while virtualizing a horizontal track."
  >
    <template #toolbar>
      <label class="demo-chip">
        Filter
        <input
          v-model="search"
          data-testid="demo:control:filter"
          type="text"
          placeholder="Search cards"
        >
      </label>

      <span
        class="demo-chip"
        data-testid="demo:metric:cards"
      >Visible cards: {{ filteredRows.length }}</span>
      <span class="demo-chip">Tip: use Shift + wheel for horizontal scrolling</span>
    </template>

    <DynamicScroller
      class="demo-viewport demo-horizontal-track"
      data-testid="demo:viewport"
      :items="filteredRows"
      :min-item-size="180"
      direction="horizontal"
    >
      <template #default="{ item, index, active }">
        <DynamicScrollerItem
          :item="item"
          :active="active"
          :size-dependencies="[item.message]"
          :style="{ width: `${cardWidth(item.message)}px` }"
          class="demo-horizontal-card"
          data-testid="demo:card"
          :data-card-id="String(item.id)"
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

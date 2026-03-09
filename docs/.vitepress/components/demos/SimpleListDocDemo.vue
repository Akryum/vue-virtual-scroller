<script setup lang="ts">
import { computed, ref } from 'vue'
import DynamicScroller from '../../../../packages/vue-virtual-scroller/src/components/DynamicScroller.vue'
import DynamicScrollerItem from '../../../../packages/vue-virtual-scroller/src/components/DynamicScrollerItem.vue'
import RecycleScroller from '../../../../packages/vue-virtual-scroller/src/components/RecycleScroller.vue'
import DemoShell from './DemoShell.vue'
import { createSimpleStrings } from './demo-data'

const useDynamic = ref(true)
const search = ref('')
const rows = ref(createSimpleStrings(4000, 505))

const filteredRows = computed(() => {
  const term = search.value.trim().toLowerCase()
  if (!term)
    return rows.value
  return rows.value.filter(item => item.toLowerCase().includes(term))
})
</script>

<template>
  <DemoShell
    title="Simple list"
    description="Ported from the simple-list demo. Switch between DynamicScroller and RecycleScroller with a single control."
  >
    <template #toolbar>
      <label class="demo-chip">
        Filter
        <input
          v-model="search"
          type="text"
          placeholder="Find sentence"
        >
      </label>

      <label class="demo-chip">
        Dynamic mode
        <input
          v-model="useDynamic"
          type="checkbox"
        >
      </label>

      <span class="demo-chip">Rows: {{ filteredRows.length }}</span>
    </template>

    <DynamicScroller
      v-if="useDynamic"
      class="demo-viewport"
      :items="filteredRows"
      :min-item-size="58"
    >
      <template #before>
        <div class="demo-notice">
          Dynamic mode handles variable sentence height.
        </div>
      </template>
      <template #default="{ item, index, active }">
        <DynamicScrollerItem
          :item="item"
          :active="active"
          :index="index"
          :size-dependencies="[item]"
          class="demo-message-row"
        >
          <div class="demo-avatar" :style="{ background: 'linear-gradient(145deg, #4a7c59, #234f35)' }">
            {{ String(index + 1).slice(-2).padStart(2, '0') }}
          </div>
          <div class="demo-message-body">{{ item }}</div>
          <small class="demo-message-meta">dynamic</small>
        </DynamicScrollerItem>
      </template>
    </DynamicScroller>

    <RecycleScroller
      v-else
      class="demo-viewport"
      :items="filteredRows"
      :item-size="58"
    >
      <template #default="{ item, index }">
        <div class="demo-message-row">
          <div class="demo-avatar" :style="{ background: 'linear-gradient(145deg, #7b2cbf, #3c096c)' }">
            {{ String(index + 1).slice(-2).padStart(2, '0') }}
          </div>
          <div class="demo-message-body">{{ item }}</div>
          <small class="demo-message-meta">fixed</small>
        </div>
      </template>
    </RecycleScroller>
  </DemoShell>
</template>

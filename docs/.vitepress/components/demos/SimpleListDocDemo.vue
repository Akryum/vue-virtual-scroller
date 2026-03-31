<script setup lang="ts">
import { computed, ref } from 'vue'
import DynamicScroller from '../../../../packages/vue-virtual-scroller/src/components/DynamicScroller.vue'
import DynamicScrollerItem from '../../../../packages/vue-virtual-scroller/src/components/DynamicScrollerItem.vue'
import RecycleScroller from '../../../../packages/vue-virtual-scroller/src/components/RecycleScroller.vue'
import { createSimpleStrings } from './demo-data'
import DemoShell from './DemoShell.vue'

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
    demo-id="simple-list"
    title="Fixed vs dynamic sizing"
    description="Compares measured and fixed-size virtualization on the same filtered dataset."
  >
    <template #toolbar>
      <label class="demo-chip">
        Filter
        <input
          v-model="search"
          data-testid="demo:control:filter"
          type="text"
          placeholder="Search the list"
        >
      </label>

      <label class="demo-chip">
        Use dynamic sizing
        <input
          v-model="useDynamic"
          data-testid="demo:control:dynamic-mode"
          type="checkbox"
        >
      </label>

      <span
        class="demo-chip"
        data-testid="demo:metric:rows"
      >Matching rows: {{ filteredRows.length }}</span>
    </template>

    <DynamicScroller
      v-if="useDynamic"
      class="demo-viewport"
      data-testid="demo:viewport"
      :items="filteredRows"
      :min-item-size="58"
    >
      <template #default="{ item, index, active }">
        <DynamicScrollerItem
          :item="item"
          :active="active"
          :index="index"
          :size-dependencies="[item]"
          class="demo-message-row"
          data-testid="demo:row"
          :data-row-id="item"
        >
          <div class="demo-avatar" :style="{ background: 'linear-gradient(145deg, #4a7c59, #234f35)' }">
            {{ String(index + 1).slice(-2).padStart(2, '0') }}
          </div>
          <div class="demo-message-body">
            {{ item }}
          </div>
          <small class="demo-message-meta">measured</small>
        </DynamicScrollerItem>
      </template>
    </DynamicScroller>

    <RecycleScroller
      v-else
      class="demo-viewport"
      data-testid="demo:viewport"
      :items="filteredRows"
      :item-size="58"
    >
      <template #default="{ item, index }">
        <div
          class="demo-message-row"
          data-testid="demo:row"
          :data-row-id="item"
        >
          <div class="demo-avatar" :style="{ background: 'linear-gradient(145deg, #7b2cbf, #3c096c)' }">
            {{ String(index + 1).slice(-2).padStart(2, '0') }}
          </div>
          <div class="demo-message-body">
            {{ item }}
          </div>
          <small class="demo-message-meta">fixed size</small>
        </div>
      </template>
    </RecycleScroller>
  </DemoShell>
</template>

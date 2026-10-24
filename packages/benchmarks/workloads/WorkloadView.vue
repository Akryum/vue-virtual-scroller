<script setup lang="ts">
import type { WorkloadState } from './state'
import { computed, ref } from 'vue'
import CustomerTable from './CustomerTable.vue'
import DynamicList from './DynamicList.vue'
import FixedList from './FixedList.vue'
import SectionedList from './SectionedList.vue'
import WindowFeed from './WindowFeed.vue'
/** A single renderer owns each mounted workload; content remains shared across modes. */
const props = defineProps<{ model: WorkloadState }>()
const view = ref<{ jump: (index: number) => void }>()
const renderer = computed(() => {
  switch (props.model.config.workload) {
    case 'activity-feed': case 'horizontal-cards': return DynamicList
    case 'customer-table': return CustomerTable
    case 'window-feed': return WindowFeed
    case 'project-explorer': case 'code-review': return SectionedList
    default: return FixedList
  }
})
/** Delegate public jump to the lifecycle owner. */
function jump(index: number) {
  view.value?.jump(index)
}
defineExpose({ jump })
</script>

<template>
  <component :is="renderer" ref="view" :model="model" />
  <aside v-if="model.state.detail != null" class="detail" aria-label="Inventory details">
    <strong>{{ model.state.records.find(row => row.id === model.state.detail)?.title }}</strong>
    <p>{{ model.state.records.find(row => row.id === model.state.detail)?.stock }} available units</p>
    <button @click="model.details(null)">
      Close details
    </button>
  </aside>
</template>

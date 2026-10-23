<script setup lang="ts">
import type { WorkloadState } from './state'
import { computed, ref } from 'vue'
import { RecycleScroller } from 'vue-virtual-scroller'
import InventoryCell from '../components/InventoryCell.vue'
import IssueRow from '../components/IssueRow.vue'
import ProductCard from '../components/ProductCard.vue'
import MatrixHeaders from './MatrixHeaders.vue'
import { matrixSide } from './registry'
/** Fixed rows, product grid, and genuinely two-axis matrix. */
const props = defineProps<{ model: WorkloadState }>()
const scroller = ref<{ scrollToItem: (index: number) => void }>()
const headers = ref<InstanceType<typeof MatrixHeaders>>()
const matrix = computed(() => props.model.config.workload === 'inventory-matrix')
const grid = computed(() => props.model.config.workload === 'product-grid')
const columns = computed(() => matrix.value ? matrixSide(props.model.config.count) : props.model.state.columns)
const height = computed(() => matrix.value ? 88 : grid.value ? 320 : 112)
const width = computed(() => matrix.value ? 140 : 240)
const rows = props.model.rows
/** Keep hot header offsets in their own component so scrolling cannot rerender cells. */
function trackScroll(event: Event) {
  const target = event.target as HTMLElement
  headers.value?.syncScroll(target.scrollLeft, target.scrollTop)
}
/** Public package jump for virtual mode; native DOM jump for plain mode. */
function jump(index: number) {
  if (props.model.config.mode === 'virtual')
    scroller.value?.scrollToItem(index)
  else document.querySelector<HTMLElement>(`[data-record][data-id="${rows.value[index].id}"]`)?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
}
defineExpose({ jump })
</script>

<template>
  <div :class="{ 'matrix-layout': matrix }">
    <MatrixHeaders v-if="matrix" ref="headers" :rows="rows" :columns="columns" :width="model.state.width" />
    <RecycleScroller
      v-if="model.config.mode === 'virtual'" ref="scroller" class="viewport" data-viewport
      :style="{ width: `${model.state.width}px` }" :items="rows" :item-size="height"
      :grid-items="matrix || grid ? columns : undefined" :item-secondary-size="width" @scroll.passive="trackScroll"
    >
      <template #default="{ item }">
        <InventoryCell v-if="matrix" :row="item" @details="model.details($event)" />
        <ProductCard v-else-if="grid" :row="item" :selected="model.state.selected.has(item.id)" @select="model.select" />
        <IssueRow v-else :row="item" :selected="model.state.selected.has(item.id)" @select="model.select" />
      </template>
    </RecycleScroller>
    <div v-else class="viewport" data-viewport :style="{ width: `${model.state.width}px` }" @scroll.passive="trackScroll">
      <div :style="matrix || grid ? { display: 'grid', gridTemplateColumns: `repeat(${columns}, ${width}px)`, width: `${columns * width}px` } : undefined">
        <template v-for="item in rows" :key="item.id">
          <InventoryCell v-if="matrix" :row="item" @details="model.details($event)" />
          <ProductCard v-else-if="grid" :row="item" :selected="model.state.selected.has(item.id)" @select="model.select" />
          <IssueRow v-else :row="item" :selected="model.state.selected.has(item.id)" @select="model.select" />
        </template>
      </div>
    </div>
  </div>
</template>

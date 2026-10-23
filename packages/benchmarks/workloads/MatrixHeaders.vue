<script setup lang="ts">
import type { BenchRecord } from '../data/types'
import { computed, ref } from 'vue'

/** Shared product/warehouse labels; scroll changes stay outside record-renderer ancestry. */
const props = defineProps<{
  /** Current complete cell order, shared with virtual and plain content. */
  rows: BenchRecord[]
  /** Number of warehouses in each product row. */
  columns: number
  /** Content viewport width, excluding product labels. */
  width: number
}>()
const offset = ref({ x: 0, y: 0 })
const matrixRows = computed(() => props.rows.filter((_, index) => index % props.columns === 0))

/** Synchronize labels without invalidating the parent scroller or its pooled views. */
function syncScroll(x: number, y: number) {
  offset.value = { x, y }
}
defineExpose({ syncScroll })
</script>

<template>
  <div class="matrix-corner">
    Product / warehouse
  </div>
  <div class="matrix-columns" :style="{ width: `${width}px` }">
    <div :style="{ width: `${columns * 140}px`, transform: `translateX(${-offset.x}px)` }">
      <span v-for="column in columns" :key="column">Warehouse {{ column }}</span>
    </div>
  </div>
  <div class="matrix-rows">
    <div :style="{ transform: `translateY(${-offset.y}px)` }">
      <span v-for="(row, index) in matrixRows" :key="row.id">{{ row.name }}<small>Product {{ row.row + 1 }} · row {{ index + 1 }}</small></span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BenchRecord } from '../data/types'
import { money, recordAttributes } from './format'
/** Fixed-size catalogue card with a real product action. */
defineProps<{ row: BenchRecord, selected: boolean }>()
const emit = defineEmits<{ select: [id: number] }>()
</script>

<template>
  <article v-bind="recordAttributes(row, selected)" class="product" :class="{ selected }">
    <img :src="row.asset" :alt="row.name" width="208" height="120">
    <small>{{ row.group }} · SKU-{{ String(row.id).padStart(6, '0') }}</small>
    <strong>{{ row.title }}</strong>
    <footer><b>{{ money(row.amount) }}</b><span>{{ (4 + row.comments / 100).toFixed(1) }} / 5 · {{ row.comments }} reviews</span></footer>
    <span>{{ row.stock }} available</span>
    <button :aria-pressed="selected" @click="emit('select', row.id)">
      {{ selected ? 'Remove from selection' : 'Add to selection' }}
    </button>
  </article>
</template>

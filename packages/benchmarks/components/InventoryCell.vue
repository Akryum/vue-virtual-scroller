<script setup lang="ts">
import type { BenchRecord } from '../data/types'
import { recordAttributes } from './format'
/** Fixed-size, interactive two-axis inventory cell. */
defineProps<{ row: BenchRecord }>()
const emit = defineEmits<{ details: [id: number] }>()
</script>

<template>
  <button v-bind="recordAttributes(row)" class="inventory" :aria-label="row.title" @click="emit('details', row.id)">
    <strong>{{ row.stock }} units</strong><small>{{ row.reserved }} reserved</small><span class="badge">{{ row.stock > 100 ? 'In stock' : 'Low stock' }}</span>
  </button>
</template>

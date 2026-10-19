<script setup lang="ts">
import type { BenchRecord } from '../data/types'
import { money, recordAttributes } from './format'
/** Semantic account row; both renderers use the same component. */
defineProps<{ row: BenchRecord, selected: boolean }>()
const emit = defineEmits<{ select: [id: number] }>()
</script>

<template>
  <tr v-bind="recordAttributes(row, selected)" :class="{ selected }">
    <td><input type="checkbox" :aria-label="`Select account ${row.id}`" :checked="selected" @change="emit('select', row.id)"></td>
    <td><strong>{{ row.title }}</strong><small>{{ row.owner }} · account-{{ row.id }}@northstar.example</small></td>
    <td>{{ row.group }}</td><td><span class="badge">{{ row.status }}</span><small>Business plan</small></td>
    <td>{{ money(row.amount) }}</td><td><p>{{ row.body }}</p></td>
  </tr>
</template>

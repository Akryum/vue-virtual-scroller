<script setup lang="ts">
import type { BenchRecord } from '../data/types'
import { recordAttributes } from './format'
/** Project caption with its own actions, pinned while its rows scroll. */
defineProps<{ row: BenchRecord, selected: boolean, expanded: boolean, pinned?: boolean }>()
const emit = defineEmits<{ select: [id: number] }>()
</script>

<template>
  <div v-bind="pinned ? {} : recordAttributes(row, selected, expanded)" class="tree-row tree-project" :class="{ selected }">
    <header>
      <span class="tree-icon" aria-hidden="true">▾</span><strong>{{ row.title }}</strong>
      <span class="badge">{{ row.comments }} changes</span>
      <span class="tree-actions"><button type="button" @click="emit('select', row.id)">Fetch</button><button type="button">New branch</button></span>
    </header>
    <p v-if="expanded" class="tree-details">
      {{ row.body }}
    </p>
  </div>
</template>

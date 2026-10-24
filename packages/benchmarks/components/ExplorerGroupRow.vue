<script setup lang="ts">
import type { BenchRecord } from '../data/types'
import { recordAttributes } from './format'
/** Second-level caption grouping branches or commits. */
defineProps<{ row: BenchRecord, selected: boolean, expanded: boolean, pinned?: boolean }>()
</script>

<template>
  <div v-bind="pinned ? {} : recordAttributes(row, selected, expanded)" class="tree-row tree-group" :class="{ selected }">
    <header>
      <span class="tree-icon" aria-hidden="true">▾</span><small>{{ row.title }}</small>
    </header>
    <p v-if="expanded" class="tree-details">
      Grouped by most recent activity.
    </p>
  </div>
</template>

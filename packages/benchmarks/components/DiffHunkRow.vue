<script setup lang="ts">
import type { BenchRecord } from '../data/types'
import { recordAttributes } from './format'
/** Hunk header separating diff sections. */
defineProps<{ row: BenchRecord, selected: boolean, expanded: boolean, pinned?: boolean }>()
</script>

<template>
  <div v-bind="pinned ? {} : recordAttributes(row, selected, expanded)" class="diff-hunk" :class="{ selected }">
    <code>{{ row.title }}</code>
  </div>
</template>

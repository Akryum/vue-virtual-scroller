<script setup lang="ts">
import type { BenchRecord } from '../data/types'
import { recordAttributes } from './format'
/** File header of a continuous diff, pinned while its lines scroll. */
defineProps<{ row: BenchRecord, selected: boolean, expanded: boolean, pinned?: boolean }>()
const emit = defineEmits<{ select: [id: number] }>()
</script>

<template>
  <div v-bind="pinned ? {} : recordAttributes(row, selected, expanded)" class="diff-file" :class="{ selected }">
    <header>
      <strong>{{ row.title }}</strong>
      <span class="badge">+{{ row.comments * 3 }} −{{ row.progress * 2 }}</span>
      <span class="tree-actions">
        <label><input type="checkbox" :aria-label="`Mark ${row.id} viewed`" :checked="selected" @change="emit('select', row.id)"> Viewed</label>
        <button type="button">Open file</button>
      </span>
    </header>
    <p v-if="expanded" class="tree-details">
      {{ row.comments }} review comments on this file.
    </p>
  </div>
</template>

<script setup lang="ts">
import type { BenchRecord } from '../data/types'
import AvatarBadge from './AvatarBadge.vue'
import { recordAttributes } from './format'
/** Commit leaf with CI status, author, and row actions. */
defineProps<{ row: BenchRecord, selected: boolean, expanded: boolean, pinned?: boolean }>()
const emit = defineEmits<{ select: [id: number] }>()
</script>

<template>
  <div v-bind="pinned ? {} : recordAttributes(row, selected, expanded)" class="tree-row tree-leaf" :class="{ selected }">
    <header>
      <input type="checkbox" :aria-label="`Select commit ${row.id}`" :checked="selected" @change="emit('select', row.id)">
      <strong>{{ row.title }}</strong>
      <span class="badge" :class="`status-${row.status.toLowerCase()}`">{{ row.status }}</span>
      <AvatarBadge class="tree-avatar" :name="row.owner" /><time>{{ row.updated }}</time>
      <span class="tree-actions"><button type="button">Open</button><button type="button">Cherry-pick</button></span>
    </header>
    <p v-if="expanded" class="tree-details">
      {{ row.body }} {{ row.comments }} comments.
    </p>
  </div>
</template>

<script setup lang="ts">
import type { BenchRecord } from '../data/types'
import AvatarBadge from './AvatarBadge.vue'
import { recordAttributes } from './format'
/** Branch leaf with sync state and row actions. */
defineProps<{ row: BenchRecord, selected: boolean, expanded: boolean, pinned?: boolean }>()
const emit = defineEmits<{ select: [id: number] }>()
</script>

<template>
  <div v-bind="pinned ? {} : recordAttributes(row, selected, expanded)" class="tree-row tree-leaf" :class="{ selected }">
    <header>
      <input type="checkbox" :aria-label="`Select branch ${row.id}`" :checked="selected" @change="emit('select', row.id)">
      <strong>{{ row.title }}</strong>
      <span class="badge">↑{{ row.priority }} ↓{{ row.progress }}</span>
      <AvatarBadge class="tree-avatar" :name="row.owner" />
      <span class="tree-actions"><button type="button">Checkout</button><button type="button">Compare</button></span>
    </header>
    <p v-if="expanded" class="tree-details">
      {{ row.body }}
    </p>
  </div>
</template>

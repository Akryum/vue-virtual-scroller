<script setup lang="ts">
import type { BenchRecord } from '../data/types'
import AvatarBadge from './AvatarBadge.vue'
import { recordAttributes } from './format'
/** Identical issue content in virtual and plain branches. */
defineProps<{ row: BenchRecord, selected: boolean }>()
const emit = defineEmits<{ select: [id: number] }>()
</script>

<template>
  <article v-bind="recordAttributes(row, selected)" class="issue row" :class="{ selected }">
    <input type="checkbox" :aria-label="`Select issue ${row.id}`" :checked="selected" @change="emit('select', row.id)">
    <div class="grow">
      <header><small>#{{ row.id }}</small><strong>{{ row.title }}</strong><span class="badge">{{ row.group }}</span></header>
      <p class="excerpt">
        {{ row.body }}
      </p>
      <footer><span class="badge">P{{ row.priority }}</span><span>Customer experience</span><span>{{ row.comments }} comments</span><time>{{ row.updated }}</time></footer>
    </div>
    <AvatarBadge :name="row.owner" />
  </article>
</template>

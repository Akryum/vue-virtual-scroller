<script setup lang="ts">
import type { BenchRecord } from '../data/types'
import { recordAttributes } from './format'
/** Known-height editorial preview for document-level scrolling. */
defineProps<{ row: BenchRecord }>()
</script>

<template>
  <article v-bind="recordAttributes(row)" class="news row" :style="{ height: `${row.height}px` }">
    <img v-if="row.height > 112" :src="row.asset" alt="Article equipment illustration" width="144" height="88">
    <div class="grow">
      <small>{{ row.group }}</small><strong>{{ row.title }}</strong><p v-if="row.height > 112" class="excerpt">
        {{ row.body }}
      </p><footer>{{ row.owner }} · {{ row.updated }}</footer>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { BenchRecord } from '../data/types'
import AvatarBadge from './AvatarBadge.vue'
import { projectWidth, recordAttributes } from './format'
/** Content expansion changes measured horizontal width. */
defineProps<{ row: BenchRecord, expanded: boolean }>()
const emit = defineEmits<{ expand: [id: number] }>()
</script>

<template>
  <article v-bind="recordAttributes(row, false, expanded)" class="project" :style="{ width: `${projectWidth(row, expanded)}px` }">
    <span class="badge">{{ row.status }}</span><strong>{{ row.title }}</strong><p>{{ row.body }}</p>
    <div class="row">
      <AvatarBadge :name="row.owner" /><span>{{ row.owner }}<small>3 contributors</small></span>
    </div>
    <label>Delivery progress <progress :value="row.progress" max="100" />{{ row.progress }}%</label>
    <button :aria-expanded="expanded" @click="emit('expand', row.id)">
      {{ expanded ? 'Hide milestones' : 'Show milestones' }}
    </button>
    <ul v-if="expanded">
      <li v-for="step in row.steps" :key="step">
        {{ step }}
      </li>
    </ul>
  </article>
</template>

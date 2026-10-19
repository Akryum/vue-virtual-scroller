<script setup lang="ts">
import type { BenchRecord } from '../data/types'
import AvatarBadge from './AvatarBadge.vue'
import { recordAttributes } from './format'
/** Height comes from actual content and optional expanded discussion. */
defineProps<{ row: BenchRecord, expanded: boolean }>()
const emit = defineEmits<{ expand: [id: number] }>()
</script>

<template>
  <article v-bind="recordAttributes(row, false, expanded)" class="feed-entry row">
    <AvatarBadge :name="row.owner" />
    <div class="grow">
      <header><strong>{{ row.title }}</strong><span class="badge">{{ row.kind }}</span></header>
      <footer><span>{{ row.owner }}</span><time>{{ row.updated }}</time></footer>
      <p>{{ row.body }}</p>
      <ul v-if="row.kind === 'checklist'">
        <li v-for="step in row.steps" :key="step">
          {{ step }}
        </li>
      </ul>
      <pre v-if="row.kind === 'code'"><code>const policy = { retries: 3, delay: 250 }
await reconnectWorkspace(policy)</code></pre>
      <div v-if="row.kind === 'attachment'" class="attachment">
        <img :src="row.asset" alt="Workspace equipment preview" width="120" height="72"><span>Migration field notes.pdf · 248 KB</span>
      </div>
      <p v-if="row.kind === 'incident'" class="notice">
        Resolved · Queue latency returned to normal after workers recovered.
      </p>
      <p v-if="row.kind === 'deployment'" class="notice">
        Production · Release 2026.10.{{ row.id }} · Health checks passed
      </p>
      <button :aria-expanded="expanded" @click="emit('expand', row.id)">
        {{ expanded ? 'Hide discussion' : 'Show discussion' }}
      </button>
      <div v-if="expanded" class="discussion">
        <p>{{ row.body }}</p><p>Review complete. Regional owners confirmed the handover and scheduled a follow-up after the next release.</p>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  index: number
  item: string
}

const props = defineProps<Props>()
const PUNCTUATION_RE = /\./g
const WORD_RE = /\s+/

const statusLabel = computed(() => ['queued', 'warming', 'steady', 'recycling'][props.index % 4])
const title = computed(() => props.item
  .replace(PUNCTUATION_RE, '')
  .split(WORD_RE)
  .filter(Boolean)
  .slice(0, 4)
  .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
  .join(' '))
</script>

<template>
  <div class="demo-heavy-row__header">
    <strong class="demo-heavy-row__title">{{ title }}</strong>
    <span class="demo-heavy-row__status">{{ statusLabel }}</span>
  </div>
</template>

<style scoped>
.demo-heavy-row__header {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}

.demo-heavy-row__title {
  color: var(--demo-text);
  font-size: 0.92rem;
}

.demo-heavy-row__status {
  border: 1px solid var(--demo-border);
  border-radius: 999px;
  background: color-mix(in srgb, var(--demo-surface) 92%, white 8%);
  color: var(--demo-muted);
  font-size: 0.72rem;
  line-height: 1;
  padding: 4px 7px;
  text-transform: capitalize;
}
</style>

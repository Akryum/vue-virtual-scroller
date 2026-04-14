<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  item: string
}

const props = defineProps<Props>()
const PUNCTUATION_RE = /\./g
const WORD_RE = /\s+/

const tagLabels = computed(() => props.item
  .replace(PUNCTUATION_RE, '')
  .split(WORD_RE)
  .filter(Boolean)
  .slice(0, 3)
  .map(word => word.toLowerCase()))
</script>

<template>
  <div class="demo-heavy-row__chips">
    <span
      v-for="(tag, tagIndex) in tagLabels"
      :key="`${tagIndex}:${tag}`"
      class="demo-heavy-row__chip"
    >
      {{ tag }}
    </span>
  </div>
</template>

<style scoped>
.demo-heavy-row__chips {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}

.demo-heavy-row__chip {
  border: 1px solid var(--demo-border);
  border-radius: 999px;
  background: color-mix(in srgb, var(--demo-surface) 92%, white 8%);
  color: var(--demo-muted);
  font-size: 0.72rem;
  line-height: 1;
  padding: 4px 7px;
}
</style>

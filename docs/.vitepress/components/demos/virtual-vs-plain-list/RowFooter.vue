<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  index: number
}

const props = defineProps<Props>()

const footerStats = computed(() => [
  `score ${60 + (props.index * 7) % 40}`,
  `nodes ${18 + (props.index % 6) * 3}`,
  `band ${(props.index % 12) + 1}`,
])
</script>

<template>
  <div class="demo-heavy-row__footer">
    <span
      v-for="stat in footerStats"
      :key="stat"
    >
      {{ stat }}
    </span>
  </div>
</template>

<style scoped>
.demo-heavy-row__footer {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}

.demo-heavy-row__footer span {
  border: 1px solid var(--demo-border);
  border-radius: 999px;
  background: color-mix(in srgb, var(--demo-surface) 92%, white 8%);
  color: var(--demo-muted);
  font-size: 0.72rem;
  line-height: 1;
  padding: 4px 7px;
}
</style>

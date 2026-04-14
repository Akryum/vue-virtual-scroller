<script setup lang="ts">
interface Props {
  item: string
}

defineProps<Props>()
</script>

<template>
  <p class="demo-heavy-row__summary">
    {{ item }}
  </p>
</template>

<style scoped>
.demo-heavy-row__summary {
  margin: 8px 0;
  color: var(--demo-text);
  font-size: 0.82rem;
  line-height: 1.4;
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
</style>

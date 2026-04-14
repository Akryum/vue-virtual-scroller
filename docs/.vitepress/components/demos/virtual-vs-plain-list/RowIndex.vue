<script setup lang="ts">
interface Props {
  index: number
}

defineProps<Props>()
</script>

<template>
  <small class="demo-message-meta demo-heavy-row__index">#{{ index + 1 }}</small>
</template>

<style scoped>
.demo-heavy-row__index {
  padding-top: 2px;
}
</style>

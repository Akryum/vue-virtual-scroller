<script setup lang="ts">
import { computed } from 'vue'
import { gradientAt } from '../demo-data'

interface Props {
  index: number
}

const props = defineProps<Props>()

const meterStyle = computed(() => ({
  background: gradientAt(props.index + 1),
  width: `${22 + (props.index * 11) % 74}%`,
}))
</script>

<template>
  <div class="demo-heavy-row__meter">
    <span :style="meterStyle" />
  </div>
</template>

<style scoped>
.demo-heavy-row__meter {
  margin-top: 8px;
  width: 100%;
  height: 6px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.08);
}

.demo-heavy-row__meter span {
  display: block;
  height: 100%;
  border-radius: inherit;
}
</style>

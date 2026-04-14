<script setup lang="ts">
import { computed } from 'vue'
import { gradientAt } from '../demo-data'

interface Props {
  index: number
}

const props = defineProps<Props>()

const avatarStyle = computed(() => ({ background: gradientAt(props.index) }))
const rowBadge = computed(() => String(props.index + 1).slice(-2).padStart(2, '0'))
</script>

<template>
  <div
    class="demo-avatar demo-heavy-row__avatar"
    :style="avatarStyle"
  >
    {{ rowBadge }}
  </div>
</template>

<style scoped>
.demo-heavy-row__avatar {
  margin-top: 2px;
}
</style>

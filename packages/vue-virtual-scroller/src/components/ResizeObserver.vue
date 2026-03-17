<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const emit = defineEmits<{
  notify: []
}>()

const el = ref<HTMLElement>()

let observer: ResizeObserver | null = null
let fallbackListener: (() => void) | null = null

function notify() {
  emit('notify')
}

onMounted(() => {
  const target = el.value?.parentElement
  if (!target)
    return

  if (typeof ResizeObserver !== 'undefined') {
    observer = new ResizeObserver(() => {
      notify()
    })
    observer.observe(target)
    return
  }

  fallbackListener = () => notify()
  window.addEventListener('resize', fallbackListener)
})

onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
  if (fallbackListener) {
    window.removeEventListener('resize', fallbackListener)
    fallbackListener = null
  }
})
</script>

<template>
  <div
    ref="el"
    class="vue-recycle-scroller__resize-observer"
    aria-hidden="true"
  />
</template>

<style scoped>
.vue-recycle-scroller__resize-observer {
  position: absolute;
  inset: 0;
  opacity: 0;
  pointer-events: none;
  z-index: -1;
}
</style>

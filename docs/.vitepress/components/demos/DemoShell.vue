<script setup lang="ts">
defineProps<{
  title: string
  description: string
  demoId: string
}>()
</script>

<template>
  <section
    class="demo-shell"
    :data-testid="`demo:${demoId}`"
  >
    <header class="demo-shell__header">
      <h3 class="demo-shell__title">
        {{ title }}
      </h3>
      <p class="demo-shell__description">
        {{ description }}
      </p>
    </header>
    <div
      class="demo-shell__toolbar"
      data-testid="demo:toolbar"
    >
      <slot name="toolbar" />
    </div>
    <div class="demo-shell__viewport">
      <slot />
    </div>
  </section>
</template>

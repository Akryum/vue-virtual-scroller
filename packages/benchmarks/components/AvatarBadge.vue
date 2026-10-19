<script setup lang="ts">
/** Named person represented without remote avatar dependencies. */
defineProps<{ name: string }>()
</script>

<template>
  <span class="avatar" :aria-label="name">{{ name.split(' ').map(part => part[0]).join('') }}</span>
</template>

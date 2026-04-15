---
aside: false
outline: false
---

<script setup>
import DisableTransformDocDemo from '../.vitepress/components/demos/DisableTransformDocDemo.vue'
</script>

# Disable Transform Demo

This demo focuses on `disableTransform`, which swaps pooled item positioning from CSS `translate(...)` to absolute `top` / `left`.

Grid layout makes this easy to inspect because both axes matter. Toggle the mode and watch the live readout for the first visible pooled wrapper.

## Try it yourself

- Toggle `Use top / left` to switch positioning strategy.
- Change items per row to confirm cross-axis placement still works in grid mode.
- Jump deeper into list and inspect live `top`, `left`, and `transform` values.

<DisableTransformDocDemo />


## Source code

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import { RecycleScroller } from 'vue-virtual-scroller'

const disableTransform = ref(false)
const gridItems = ref(4)

const cards = computed(() => makeCards(1500))
</script>

<template>
  <RecycleScroller
    :items="cards"
    :item-size="166"
    :item-secondary-size="176"
    :grid-items="gridItems"
    :disable-transform="disableTransform"
  >
    <template #default="{ item }">
      <article>{{ item.name }}</article>
    </template>
  </RecycleScroller>
</template>
```

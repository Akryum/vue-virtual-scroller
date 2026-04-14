<script setup>
import VirtualVsPlainListDocDemo from '../.vitepress/components/demos/VirtualVsPlainListDocDemo.vue'
</script>

# Virtual vs Plain List Demo

This demo compares one large fixed-height list with virtualization enabled and disabled, adds heavier row markup, and measures how long full list mount and unmount take.

## Try it yourself

- Toggle virtual scrolling on and off to compare rendered row counts directly.
- Toggle list visibility to compare mount and unmount times between virtual and plain modes.
- Scroll both modes and inspect how much DOM each mode keeps alive.
- Use this as quick baseline when explaining why large lists need virtualization.

<VirtualVsPlainListDocDemo />


## Source code

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import { RecycleScroller } from 'vue-virtual-scroller'
import { createSimpleStrings } from '../.vitepress/components/demos/demo-data'

const ITEM_SIZE = 152
const rows = createSimpleStrings(10000, 808)
const showList = ref(true)
const useVirtualScrolling = ref(true)
const mountDuration = ref<number | null>(null)
const unmountDuration = ref<number | null>(null)
const modeLabel = computed(() => useVirtualScrolling.value ? 'virtual' : 'plain')
</script>

<template>
  <RecycleScroller
    v-if="showList && useVirtualScrolling"
    :items="rows"
    :item-size="ITEM_SIZE"
  >
    <template #default="{ item, index }">
      <div :style="{ height: `${ITEM_SIZE}px` }">
        {{ index + 1 }}. {{ item }}
      </div>
    </template>
  </RecycleScroller>

  <div v-else-if="showList">
    <div
      v-for="(item, index) in rows"
      :key="`${index}:${item}`"
      :style="{ height: `${ITEM_SIZE}px` }"
    >
      {{ index + 1 }}. {{ item }}
    </div>
  </div>

  <p>Mode: {{ modeLabel }}</p>
  <p>Mount: {{ mountDuration }}</p>
  <p>Unmount: {{ unmountDuration }}</p>
</template>
```

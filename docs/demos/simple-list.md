<script setup>
import SimpleListDocDemo from '../.vitepress/components/demos/SimpleListDocDemo.vue'
</script>

# Simple List Demo

Use this demo to compare dynamic and fixed-size strategies on the same dataset.

What to try:

- Toggle `Dynamic mode` on/off to compare behavior.
- Filter the list and compare how both modes respond.
- Use this as a reference when deciding between `DynamicScroller` and `RecycleScroller`.

<SimpleListDocDemo />


## Relevant source code

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import { DynamicScroller, DynamicScrollerItem, RecycleScroller } from 'vue-virtual-scroller'
import { createSimpleStrings } from '../.vitepress/components/demos/demo-data'

const useDynamic = ref(true)
const search = ref('')
const rows = ref(createSimpleStrings(4000, 505))

const filteredRows = computed(() => {
  const term = search.value.trim().toLowerCase()
  if (!term)
    return rows.value
  return rows.value.filter(item => item.toLowerCase().includes(term))
})
</script>

<template>
  <DynamicScroller
    v-if="useDynamic"
    :items="filteredRows"
    :min-item-size="58"
  >
    <template #default="{ item, active }">
      <DynamicScrollerItem
        :item="item"
        :active="active"
        :size-dependencies="[item]"
      >
        {{ item }}
      </DynamicScrollerItem>
    </template>
  </DynamicScroller>

  <RecycleScroller
    v-else
    :items="filteredRows"
    :item-size="58"
  >
    <template #default="{ item }">
      {{ item }}
    </template>
  </RecycleScroller>
</template>
```

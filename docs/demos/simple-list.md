<script setup>
import SimpleListDocDemo from '../.vitepress/components/demos/SimpleListDocDemo.vue'
</script>

# Simple List Demo

This demo compares the two most common strategies on the same dataset: fixed-size virtualization with `RecycleScroller` and measured virtualization with `DynamicScroller`.

## Try it yourself

- Toggle dynamic sizing on and off to compare both rendering modes directly.
- Filter the list and compare how each mode responds.
- Use it as a quick reference when deciding between `DynamicScroller` and `RecycleScroller`.

<SimpleListDocDemo />


## Source code

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

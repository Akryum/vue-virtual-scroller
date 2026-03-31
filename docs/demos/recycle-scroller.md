<script setup>
import RecycleScrollerDocDemo from '../.vitepress/components/demos/RecycleScrollerDocDemo.vue'
</script>

# RecycleScroller Demo

This demo shows the main `RecycleScroller` workflow for large lists with known, fixed item sizes.

## Try it yourself

- Change the item count to simulate a larger dataset.
- Adjust the buffer to understand render-ahead behavior.
- Jump to a specific item to test `scrollToItem`.

<RecycleScrollerDocDemo />


## Source code

```vue
<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { RecycleScroller } from 'vue-virtual-scroller'
import { createPeopleRows } from '../.vitepress/components/demos/demo-data'

const ITEM_SIZE = 74

const count = ref(8000)
const buffer = ref(240)
const rows = ref([])

function regenerate() {
  rows.value = createPeopleRows(Math.max(50, count.value), false, 17)
}

watch(count, regenerate)
onMounted(regenerate)
</script>

<template>
  <RecycleScroller
    :items="rows"
    :item-size="ITEM_SIZE"
    :buffer="buffer"
    key-field="id"
  >
    <template #default="{ item, index }">
      <div
        :style="{ height: `${ITEM_SIZE}px` }"
      >
        {{ item.value.name }} ({{ index }})
      </div>
    </template>
  </RecycleScroller>
</template>
```

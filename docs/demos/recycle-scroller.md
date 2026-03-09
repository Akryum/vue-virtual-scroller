<script setup>
import RecycleScrollerDocDemo from '../.vitepress/components/demos/RecycleScrollerDocDemo.vue'
</script>

# RecycleScroller Demo

Use this demo when your list items have known sizes, or when sizes can be provided by data.

What to try:

- Change `Items` to simulate very large datasets.
- Toggle `Variable height` and click letter rows to see size updates.
- Tune `Buffer` to understand render-ahead behavior.
- Use `Jump` to test `scrollToItem`.

<RecycleScrollerDocDemo />


## Relevant source code

```vue
<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RecycleScroller } from 'vue-virtual-scroller'
import { createPeopleRows } from '../.vitepress/components/demos/demo-data'

const count = ref(8000)
const withLetters = ref(true)
const buffer = ref(240)
const rows = ref([])

const itemSize = computed(() => (withLetters.value ? null : 74))

function regenerate() {
  rows.value = createPeopleRows(Math.max(50, count.value), withLetters.value, 17)
}

function toggleLetterSize(row: any) {
  if (row.type === 'letter') {
    row.height = row.height === 96 ? 136 : 96
  }
}

watch([count, withLetters], regenerate)
onMounted(regenerate)
</script>

<template>
  <RecycleScroller
    :items="rows"
    :item-size="itemSize"
    :buffer="buffer"
    key-field="id"
    size-field="height"
  >
    <template #default="{ item, index }">
      <div
        v-if="item.type === 'letter'"
        :style="{ height: `${item.height}px` }"
        @click="toggleLetterSize(item)"
      >
        <strong>{{ item.value }}</strong> ({{ index }})
      </div>
      <div
        v-else
        :style="{ height: `${item.height}px` }"
      >
        {{ item.value.name }}
      </div>
    </template>
  </RecycleScroller>
</template>
```

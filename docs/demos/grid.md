<script setup>
import GridDocDemo from '../.vitepress/components/demos/GridDocDemo.vue'
</script>

# Grid Demo

Use this demo for card galleries and catalog layouts.

What to try:

- Change `Items / row` to test responsiveness.
- Jump to deep indexes with `Scroll to`.
- Validate performance with thousands of cards.

<GridDocDemo />


## Relevant source code

```vue
<script setup lang="ts">
import type { Person } from '../.vitepress/components/demos/demo-data'
import { computed, ref } from 'vue'
import { RecycleScroller } from 'vue-virtual-scroller'
import { createPeopleRows } from '../.vitepress/components/demos/demo-data'

interface GridCard extends Person {
  id: number
}

const scroller = ref<InstanceType<typeof RecycleScroller>>()
const gridItems = ref(5)
const scrollTo = ref(300)

const rawRows = createPeopleRows(2500, false, 111)

const cards = computed<GridCard[]>(() =>
  rawRows
    .filter(row => row.type === 'person')
    .map((row) => {
      const person = row.value as Person
      return {
        id: row.id,
        ...person,
      }
    }),
)

function jump() {
  const target = Math.min(Math.max(0, scrollTo.value), cards.value.length - 1)
  scroller.value?.scrollToItem(target)
}
</script>

<template>
  <RecycleScroller
    ref="scroller"
    :items="cards"
    :item-size="166"
    :grid-items="gridItems"
    :item-secondary-size="176"
  >
    <template #default="{ item }">
      <article>
        <strong>{{ item.initials }}</strong>
        <span>{{ item.name }}</span>
      </article>
    </template>
  </RecycleScroller>
</template>
```

<script setup>
import GridDocDemo from '../.vitepress/components/demos/GridDocDemo.vue'
</script>

# Grid Demo

This demo shows how `RecycleScroller` can power a grid layout when every card uses a fixed size. It is a good fit for galleries, catalogs, and card-based dashboards.

## Try it yourself

- Change the number of items per row to see how the layout adapts.
- Jump to a deeper item index to test programmatic navigation.
- Scroll through the list and confirm that the grid still feels smooth with thousands of cards.

<GridDocDemo />


## Source code

```vue
<script setup lang="ts">
import type { Person } from '../.vitepress/components/demos/demo-data'
import { computed, ref, useTemplateRef } from 'vue'
import { RecycleScroller } from 'vue-virtual-scroller'
import { createPeopleRows } from '../.vitepress/components/demos/demo-data'

interface GridCard extends Person {
  id: number
}

type RecycleScrollerExposed = InstanceType<typeof RecycleScroller> & {
  visiblePool?: Array<{ nr: { index: number } }>
}

const scroller = useTemplateRef<RecycleScrollerExposed>('scroller')
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

const renderedCardIndexes = computed(() =>
  (scroller.value?.visiblePool ?? [])
    .map(view => view.nr.index)
    .sort((a, b) => a - b),
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

  <p>Rendered cards: {{ renderedCardIndexes.map(index => `#${index}`).join(', ') }}</p>
</template>
```

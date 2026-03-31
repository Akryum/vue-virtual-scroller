<script setup lang="ts">
import type { Person } from './demo-data'
import { computed, ref } from 'vue'
import RecycleScroller from '../../../../packages/vue-virtual-scroller/src/components/RecycleScroller.vue'
import { createPeopleRows, gradientAt } from './demo-data'
import DemoShell from './DemoShell.vue'

interface GridCard extends Person {
  id: number
}

type RecycleScrollerExposed = InstanceType<typeof RecycleScroller> & {
  visiblePool?: Array<{ nr: { index: number } }>
}

const scroller = ref<RecycleScrollerExposed>()
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

const renderedCardSummary = computed(() => {
  const indexes = renderedCardIndexes.value
  if (!indexes.length)
    return 'none'

  if (indexes.length <= 12)
    return indexes.map(index => `#${index}`).join(', ')

  return [
    ...indexes.slice(0, 8).map(index => `#${index}`),
    '...',
    ...indexes.slice(-4).map(index => `#${index}`),
  ].join(', ')
})

function jump() {
  const target = Math.min(Math.max(0, scrollTo.value), cards.value.length - 1)
  scroller.value?.scrollToItem(target)
}
</script>

<template>
  <DemoShell
    demo-id="grid"
    title="Grid layout"
    description="Virtualizes large fixed-size card grids without changing the grid feel."
  >
    <template #toolbar>
      <label class="demo-chip">
        Items per row
        <input
          v-model.number="gridItems"
          data-testid="demo:control:grid-items"
          type="range"
          min="2"
          max="10"
        >
        {{ gridItems }}
      </label>

      <label class="demo-chip">
        Go to item
        <input
          v-model.number="scrollTo"
          data-testid="demo:control:scroll-to"
          type="number"
          min="0"
          :max="cards.length"
        >
      </label>

      <button
        class="demo-button"
        data-testid="demo:control:jump"
        @click="jump"
      >
        Go
      </button>

      <span
        class="demo-chip"
        data-testid="demo:metric:cards"
      >Total cards: {{ cards.length }}</span>

      <span
        class="demo-chip"
        data-testid="demo:metric:rendered-cards"
      >Rendered: {{ renderedCardIndexes.length }} ({{ renderedCardSummary }})</span>
    </template>

    <RecycleScroller
      ref="scroller"
      class="demo-viewport"
      data-testid="demo:viewport"
      :items="cards"
      :item-size="166"
      :grid-items="gridItems"
      :item-secondary-size="176"
    >
      <template #default="{ item, index }">
        <article
          class="demo-grid-card"
          data-testid="demo:card"
          :data-card-id="String(item.id)"
          :style="{ background: gradientAt(index) }"
        >
          <small>#{{ index }}</small>
          <strong>{{ item.initials }}</strong>
          <span>{{ item.name }}</span>
        </article>
      </template>
    </RecycleScroller>
  </DemoShell>
</template>

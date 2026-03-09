<script setup lang="ts">
import { computed, ref } from 'vue'
import RecycleScroller from '../../../../packages/vue-virtual-scroller/src/components/RecycleScroller.vue'
import DemoShell from './DemoShell.vue'
import { createPeopleRows, gradientAt, type Person } from './demo-data'

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
  <DemoShell
    title="Grid mode"
    description="Ported from the grid demo. RecycleScroller composes fixed-size cards in rows for large image-like layouts."
  >
    <template #toolbar>
      <label class="demo-chip">
        Items / row
        <input
          v-model.number="gridItems"
          type="range"
          min="2"
          max="10"
        >
        {{ gridItems }}
      </label>

      <label class="demo-chip">
        Scroll to
        <input
          v-model.number="scrollTo"
          type="number"
          min="0"
          :max="cards.length"
        >
      </label>

      <button
        class="demo-button"
        @click="jump"
      >
        Jump
      </button>

      <span class="demo-chip">Cards: {{ cards.length }}</span>
    </template>

    <RecycleScroller
      ref="scroller"
      class="demo-viewport"
      :items="cards"
      :item-size="166"
      :grid-items="gridItems"
      :item-secondary-size="176"
    >
      <template #default="{ item, index }">
        <article class="demo-grid-card" :style="{ background: gradientAt(index) }">
          <small>#{{ index }}</small>
          <strong>{{ item.initials }}</strong>
          <span>{{ item.name }}</span>
        </article>
      </template>
    </RecycleScroller>
  </DemoShell>
</template>

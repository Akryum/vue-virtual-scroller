<script setup lang="ts">
import type { Person } from './demo-data'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import RecycleScroller from '../../../../packages/vue-virtual-scroller/src/components/RecycleScroller.vue'
import { createPeopleRows, gradientAt } from './demo-data'
import DemoShell from './DemoShell.vue'

interface GridCard extends Person {
  id: number
}

interface StyleSnapshot {
  top: string
  left: string
  transform: string
}

type RecycleScrollerExposed = InstanceType<typeof RecycleScroller> & {
  el?: { value?: HTMLElement } | HTMLElement
  visiblePool?: Array<{ nr: { index: number } }>
}

const ITEM_SIZE = 166
const ITEM_SECONDARY_SIZE = 176

const scroller = ref<RecycleScrollerExposed>()
const disableTransform = ref(false)
const gridItems = ref(4)
const scrollTo = ref(64)
const firstVisibleStyle = ref<StyleSnapshot>({
  top: '0px',
  left: '0px',
  transform: 'translateY(0px) translateX(0px)',
})

const rawRows = createPeopleRows(1500, false, 222)

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

  if (indexes.length <= 10)
    return indexes.map(index => `#${index}`).join(', ')

  return `${indexes.slice(0, 6).map(index => `#${index}`).join(', ')}, ..., ${indexes.slice(-3).map(index => `#${index}`).join(', ')}`
})

/**
 * Resolve rendered scroller root element from exposed component instance.
 */
function getScrollerElement() {
  const exposedEl = scroller.value?.el
  if (exposedEl && typeof exposedEl === 'object' && 'value' in exposedEl) {
    return exposedEl.value
  }
  return exposedEl
}

/**
 * Read first visible pooled wrapper style so demo can show current positioning strategy.
 */
function updateStyleSnapshot() {
  const root = getScrollerElement()
  const viewEls = [...root?.querySelectorAll('.vue-recycle-scroller__item-view') ?? []] as HTMLElement[]
  const firstVisibleView = viewEls.find(el => el.style.visibility !== 'hidden') ?? viewEls[0]

  if (!firstVisibleView) {
    return
  }

  firstVisibleStyle.value = {
    top: firstVisibleView.style.top || '0px',
    left: firstVisibleView.style.left || '0px',
    transform: firstVisibleView.style.transform || 'none',
  }
}

/**
 * Wait for DOM update and then refresh style readout.
 */
async function syncStyleSnapshot() {
  await nextTick()
  requestAnimationFrame(() => {
    updateStyleSnapshot()
  })
}

/**
 * Scroll to requested card index.
 */
function jump() {
  const target = Math.min(Math.max(0, scrollTo.value), cards.value.length - 1)
  scroller.value?.scrollToItem(target)
}

watch([disableTransform, gridItems], syncStyleSnapshot)
onMounted(syncStyleSnapshot)
</script>

<template>
  <DemoShell
    demo-id="disable-transform"
    title="Disable transform on pooled grid items"
    description="Toggle between translate-based positioning and top/left positioning while keeping fixed-grid cross-axis placement intact."
  >
    <template #toolbar>
      <label class="demo-chip">
        Use top / left
        <input
          v-model="disableTransform"
          data-testid="demo:control:disable-transform"
          type="checkbox"
        >
      </label>

      <label class="demo-chip">
        Items per row
        <input
          v-model.number="gridItems"
          data-testid="demo:control:grid-items"
          type="range"
          min="2"
          max="8"
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

      <span class="demo-chip">Mode: {{ disableTransform ? 'top / left' : 'transform' }}</span>
      <span class="demo-chip">Visible: {{ renderedCardSummary }}</span>
      <span class="demo-chip">top: {{ firstVisibleStyle.top }}</span>
      <span class="demo-chip">left: {{ firstVisibleStyle.left }}</span>
      <span class="demo-chip demo-chip--wide">transform: {{ firstVisibleStyle.transform }}</span>
    </template>

    <RecycleScroller
      ref="scroller"
      class="demo-viewport"
      data-testid="demo:viewport"
      :items="cards"
      :item-size="ITEM_SIZE"
      :item-secondary-size="ITEM_SECONDARY_SIZE"
      :grid-items="gridItems"
      :disable-transform="disableTransform"
      @update="syncStyleSnapshot"
    >
      <template #default="{ item, index }">
        <article
          class="demo-grid-card demo-disable-transform-card"
          data-testid="demo:card"
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

<style scoped>
.demo-disable-transform-card {
  min-height: 100%;
}

.demo-chip--wide {
  max-width: min(32rem, 100%);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>

<script setup lang="ts">
import type { ItemWithSize, View } from '../../../../packages/vue-virtual-scroller/src/types'
import type { TableRow } from './demo-data'
import { computed, ref } from 'vue'
import { useDynamicScroller } from '../../../../packages/vue-virtual-scroller/src/composables/useDynamicScroller'
import { createTableRows } from './demo-data'
import DemoShell from './DemoShell.vue'

const MIN_ROW_HEIGHT = 62

const count = ref(12000)
const buffer = ref(280)
const filter = ref('')
const scrollTo = ref(240)
const scrollerEl = ref<HTMLElement>()

const visibleStart = ref(0)
const visibleEnd = ref(0)

const rows = computed(() => createTableRows(Math.max(50, count.value), 2026))

const filteredRows = computed(() => {
  const term = filter.value.trim().toLowerCase()
  if (!term)
    return rows.value

  return rows.value.filter(row =>
    row.name.toLowerCase().includes(term)
    || row.email.toLowerCase().includes(term)
    || row.region.toLowerCase().includes(term)
    || row.status.toLowerCase().includes(term)
    || row.summary.toLowerCase().includes(term),
  )
})

const dynamicScroller = useDynamicScroller(computed(() => ({
  items: filteredRows.value,
  keyField: 'id',
  direction: 'vertical' as const,
  minItemSize: MIN_ROW_HEIGHT,
  el: scrollerEl.value,
  buffer: buffer.value,
  emitUpdate: true,
  onUpdate(_startIndex, _endIndex, visibleStartIndex, visibleEndIndex) {
    visibleStart.value = visibleStartIndex
    visibleEnd.value = visibleEndIndex
  },
})))

const {
  pool,
  totalSize,
  handleScroll,
  scrollToItem,
  vDynamicScrollerItem,
} = dynamicScroller

function itemWithSizeOf(item: unknown) {
  return item as ItemWithSize
}

function rowOf(view: View) {
  return itemWithSizeOf(view.item).item as TableRow
}

function sizeDependencies(view: View) {
  const item = rowOf(view)
  return [
    item.name,
    item.summary,
    item.email,
    item.region,
    item.status,
  ]
}

function jump() {
  if (!filteredRows.value.length)
    return

  const target = Math.min(Math.max(0, scrollTo.value), filteredRows.value.length - 1)
  scrollToItem(target)
}
</script>

<template>
  <DemoShell
    demo-id="headless-table"
    title="Headless table"
    description="Keeps semantic table markup while useDynamicScroller handles measurement, pooling, and scrolling."
  >
    <template #toolbar>
      <label class="demo-chip">
        Rows
        <input
          v-model.number="count"
          data-testid="demo:control:rows"
          type="number"
          min="50"
          max="50000"
        >
      </label>

      <label class="demo-chip">
        Filter
        <input
          v-model="filter"
          data-testid="demo:control:filter"
          type="text"
          placeholder="Filter by name, region, or status"
        >
      </label>

      <label class="demo-chip">
        Buffer
        <input
          v-model.number="buffer"
          data-testid="demo:control:buffer"
          type="range"
          min="100"
          max="1800"
          step="20"
        >
        {{ buffer }}px
      </label>

      <label class="demo-chip">
        Go to row
        <input
          v-model.number="scrollTo"
          data-testid="demo:control:scroll-to"
          type="number"
          min="0"
          :max="Math.max(filteredRows.length - 1, 0)"
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
        data-testid="demo:metric:rows"
      >Matching rows: {{ filteredRows.length }}</span>
      <span
        class="demo-chip"
        data-testid="demo:metric:visible-range"
      >Visible rows: {{ visibleStart }}-{{ visibleEnd }}</span>
    </template>

    <div
      ref="scrollerEl"
      class="demo-viewport demo-table-viewport"
      data-testid="demo:viewport"
      @scroll.passive="handleScroll"
    >
      <table class="demo-headless-table">
        <thead class="demo-headless-table__head">
          <tr class="demo-headless-table__row demo-headless-table__row--head">
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Region</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody
          class="demo-headless-table__body"
          :style="{ height: `${totalSize}px` }"
        >
          <tr
            v-for="view in pool"
            :key="view.nr.id"
            v-dynamic-scroller-item="{
              view,
              sizeDependencies: sizeDependencies(view),
            }"
            class="demo-headless-table__row"
            data-testid="demo:row"
            :data-row-id="String(rowOf(view).id)"
          >
            <td>#{{ rowOf(view).id }}</td>
            <td>
              <div class="demo-table-cell">
                <strong class="demo-table-cell__primary">{{ rowOf(view).name }}</strong>
                <span class="demo-table-cell__secondary">{{ rowOf(view).summary }}</span>
              </div>
            </td>
            <td>
              <span
                class="demo-table-cell__mono"
                :title="rowOf(view).email"
              >{{ rowOf(view).email }}</span>
            </td>
            <td>{{ rowOf(view).region }}</td>
            <td>
              <span
                class="demo-status-badge"
                :data-status="rowOf(view).status.toLowerCase()"
              >
                {{ rowOf(view).status }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </DemoShell>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useDynamicScroller } from '../../../../packages/vue-virtual-scroller/src/composables/useDynamicScroller'
import { useTableColumnWidths } from '../../../../packages/vue-virtual-scroller/src/composables/useTableColumnWidths'
import { createTableRows } from './demo-data'
import DemoShell from './DemoShell.vue'
import HeadlessTableRow from './HeadlessTableRow.vue'

const MIN_ROW_HEIGHT = 62

const count = ref(12000)
const buffer = ref(280)
const filter = ref('')
const scrollTo = ref(240)
const scrollerEl = ref<HTMLElement>()
const tableEl = ref<HTMLTableElement>()

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

const dynamicScrollerOptions = reactive({
  get items() {
    return filteredRows.value
  },
  keyField: (item: { id: number }) => item.id,
  direction: 'vertical' as const,
  minItemSize: MIN_ROW_HEIGHT,
  get el() {
    return scrollerEl.value
  },
  get buffer() {
    return buffer.value
  },
  flowMode: true,
  emitUpdate: true,
  onUpdate(_startIndex: number, _endIndex: number, visibleStartIndex: number, visibleEndIndex: number) {
    visibleStart.value = visibleStartIndex
    visibleEnd.value = visibleEndIndex
  },
})

const dynamicScroller = useDynamicScroller(dynamicScrollerOptions)

const {
  pool,
  startSpacerSize,
  endSpacerSize,
  scrollToItem,
  vDynamicScrollerItem,
} = dynamicScroller

const {
  columnWidths,
  tableStyle,
} = useTableColumnWidths({
  table: tableEl,
  dependencies: computed(() => [count.value, filter.value, buffer.value]),
})

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
    description="Keeps semantic table markup while useDynamicScroller handles row measurement and useTableColumnWidths keeps columns stable."
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
    >
      <table
        ref="tableEl"
        class="demo-headless-table"
        :style="tableStyle"
      >
        <colgroup v-if="columnWidths.length > 0">
          <col
            v-for="(width, index) in columnWidths"
            :key="index"
            :style="{ width: `${width}px` }"
          >
        </colgroup>
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
        >
          <tr
            v-if="startSpacerSize > 0"
            aria-hidden="true"
            class="demo-headless-table__spacer"
            :style="{ height: `${startSpacerSize}px` }"
          />

          <HeadlessTableRow
            v-for="view in pool"
            :key="view.nr.id"
            v-dynamic-scroller-item="{
              view,
            }"
            :row="view.item.item"
          />

          <tr
            v-if="endSpacerSize > 0"
            aria-hidden="true"
            class="demo-headless-table__spacer"
            :style="{ height: `${endSpacerSize}px` }"
          />
        </tbody>
      </table>
    </div>
  </DemoShell>
</template>

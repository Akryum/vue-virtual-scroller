---
aside: false
outline: false
---

<script setup>
import HeadlessTableDocDemo from '../.vitepress/components/demos/HeadlessTableDocDemo.vue'
</script>

# Headless Table Demo

This demo shows the headless dynamic path in a semantic table. It keeps regular `<table>`, `<tbody>`, and `<tr>` markup, measures row height through `useDynamicScroller`, and locks measured column widths through `useTableColumnWidths`.

For smooth headless rendering, treat `pool` as the render source and `visiblePool` as informational only. This example enables `flowMode`, inserts spacer rows before and after the active pooled rows, and lets the directive keep pooled DOM nodes mounted without forcing absolute positioning onto the table rows.

See also:

- [`useDynamicScroller`](../guide/use-dynamic-scroller) for the full headless dynamic API.
- [`useRecycleScroller`](../guide/use-recycle-scroller) for the fixed-size or pre-sized headless path.
- [`useTableColumnWidths`](../guide/use-table-column-widths) for stable semantic table columns.

## Try it yourself

- Filter the dataset and confirm that the table structure stays intact.
- Adjust the buffer to see how render-ahead affects measured rows.
- Jump to a specific row to confirm programmatic navigation still works.
- Resize the page to make sure horizontal overflow remains usable on smaller screens.

<HeadlessTableDocDemo />


## Source code

```vue
<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useDynamicScroller, useTableColumnWidths } from 'vue-virtual-scroller'
import HeadlessTableRow from '../.vitepress/components/demos/HeadlessTableRow.vue'

const MIN_ROW_HEIGHT = 62

const buffer = ref(280)
const scrollerEl = ref<HTMLElement>()
const tableEl = ref<HTMLTableElement>()
const rows = ref([])

const dynamicScrollerOptions = reactive({
  get items() {
    return rows.value
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
})

const {
  pool,
  startSpacerSize,
  endSpacerSize,
  vDynamicScrollerItem,
} = useDynamicScroller(dynamicScrollerOptions)

const { columnWidths, tableStyle } = useTableColumnWidths({
  table: tableEl,
  dependencies: computed(() => [rows.value.length, buffer.value]),
})
</script>

<template>
  <div
    ref="scrollerEl"
    class="demo-viewport demo-table-viewport"
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

      <tbody class="demo-headless-table__body">
        <!-- Spacer row before the active pooled rows -->
        <tr
          v-if="startSpacerSize > 0"
          aria-hidden="true"
          class="demo-headless-table__spacer"
          :style="{ height: `${startSpacerSize}px` }"
        />

        <HeadlessTableRow
          v-for="view in pool"
          :key="view.id"
          v-dynamic-scroller-item="{ view }"
          :row="view.item"
        />

        <!-- Spacer row after the active pooled rows -->
        <tr
          v-if="endSpacerSize > 0"
          aria-hidden="true"
          class="demo-headless-table__spacer"
          :style="{ height: `${endSpacerSize}px` }"
        />
      </tbody>
    </table>
  </div>
</template>
```

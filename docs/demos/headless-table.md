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
import { computed, useTemplateRef } from 'vue'
import { useDynamicScroller, useTableColumnWidths } from 'vue-virtual-scroller'

const MIN_ROW_HEIGHT = 62
const scrollerEl = useTemplateRef<HTMLElement>('scrollerEl')
const tableEl = useTemplateRef<HTMLTableElement>('tableEl')
const dynamicScroller = useDynamicScroller(computed(() => ({
  items: rows.value,
  keyField: 'id',
  direction: 'vertical' as const,
  minItemSize: MIN_ROW_HEIGHT,
  el: scrollerEl.value,
  buffer: buffer.value,
  flowMode: true,
  emitUpdate: true,
})))

const { pool, startSpacerSize, endSpacerSize, vDynamicScrollerItem } = dynamicScroller
const { columnWidths, tableStyle } = useTableColumnWidths({
  table: tableEl,
  dependencies: computed(() => [rows.value.length, filter.value, buffer.value]),
})
</script>

<template>
  <div
    ref="scrollerEl"
    class="table-viewport"
  >
    <table
      ref="tableEl"
      :style="tableStyle"
    >
      <colgroup v-if="columnWidths.length > 0">
        <col
          v-for="(width, index) in columnWidths"
          :key="index"
          :style="{ width: `${width}px` }"
        >
      </colgroup>
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Email</th>
          <th>Region</th>
          <th>Status</th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-if="startSpacerSize > 0"
          aria-hidden="true"
          :style="{ height: `${startSpacerSize}px`, padding: 0, border: 0 }"
        />

        <tr
          v-for="view in pool"
          :key="view.nr.id"
          v-dynamic-scroller-item="{
            view,
            sizeDependencies: [view.item.item.summary, view.item.item.email],
          }"
        >
          <td>{{ view.item.item.id }}</td>
          <td>{{ view.item.item.name }}</td>
          <td>{{ view.item.item.email }}</td>
          <td>{{ view.item.item.region }}</td>
          <td>{{ view.item.item.status }}</td>
        </tr>

        <tr
          v-if="endSpacerSize > 0"
          aria-hidden="true"
          :style="{ height: `${endSpacerSize}px`, padding: 0, border: 0 }"
        />
      </tbody>
    </table>
  </div>
</template>
```

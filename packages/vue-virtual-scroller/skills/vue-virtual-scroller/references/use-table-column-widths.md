# useTableColumnWidths

Scope: helper for semantic tables whose measured column widths must stay stable while rows churn.

## Provenance

Generated from the package's public semantic-table documentation at skill generation time.

## When to use

- You render a real `<table>` with `<thead>`, `<tbody>`, and semantic rows.
- Column widths should follow measured content, then stay locked.
- You want helper that works with `useDynamicScroller`, `useRecycleScroller`, or plain tables.
- You are fine with simple tables only in v1: no `colspan` or `rowspan`.

## Required inputs

- `table`: ref or getter for the target `<table>`
- optional `dependencies`: values that should trigger a fresh measurement after content changes
- optional `disabled`: clear the current lock and stop measuring

## Core props/options

Documented behavior:

- helper measures current header and measurable body rows
- helper clears any previous lock, waits for Vue DOM flush plus one animation frame, then reads widths
- helper returns pixel widths meant for a `<colgroup>`
- once widths exist, `tableStyle` switches the table to `table-layout: fixed`
- helper remeasures on dependency changes and table width changes, not on ordinary scroll

## Events/returns

Returns used most often:

- `columnWidths`
- `hasLockedWidths`
- `tableStyle`
- `scheduleMeasure()`
- `clear()`

## Pitfalls

- Use a real semantic table shape. Body measurement ignores wrong-shape rows.
- Rows hidden with `aria-hidden="true"`, `display: none`, or zero width do not contribute to measured widths.
- If widths should react to filters, density changes, or breakpoints, put those values in `dependencies`.
- This helper is v1-only for simple tables. `colspan` and `rowspan` are out of scope.
- Pair it with `flowMode` on headless table virtualization so pooled rows stay in native document flow.

## Example patterns

Semantic table with dynamic virtualization:

```vue
<script setup lang="ts">
import { computed, useTemplateRef } from 'vue'
import { useDynamicScroller, useTableColumnWidths } from 'vue-virtual-scroller'

const scrollerEl = useTemplateRef<HTMLElement>('scrollerEl')
const tableEl = useTemplateRef<HTMLTableElement>('tableEl')

const dynamicScroller = useDynamicScroller(computed(() => ({
  items: rows.value,
  keyField: 'id',
  direction: 'vertical' as const,
  minItemSize: 48,
  el: scrollerEl.value,
  flowMode: true,
})))

const { pool, vDynamicScrollerItem } = dynamicScroller

const { columnWidths, tableStyle } = useTableColumnWidths({
  table: tableEl,
  dependencies: computed(() => [rows.value.length, filter.value]),
})
</script>

<template>
  <div ref="scrollerEl">
    <table ref="tableEl" :style="tableStyle">
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
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="view in pool"
          :key="view.id"
          v-dynamic-scroller-item="{ view }"
        >
          <td>{{ view.item.id }}</td>
          <td>{{ view.item.name }}</td>
          <td>{{ view.item.email }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
```

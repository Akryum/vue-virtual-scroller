# useTableColumnWidths

`useTableColumnWidths` is generic helper for semantic tables whose column widths must stay stable while rows churn.

Use it when native table auto layout keeps changing as virtualized rows enter and leave render pool.

## When to use it

- You render a real `<table>` with `<thead>`, `<tbody>`, and semantic rows.
- Column widths should follow measured content, then stay locked.
- You want helper that works with `useDynamicScroller`, `useRecycleScroller`, or plain tables.
- You are fine with simple tables only in v1: no `colspan` or `rowspan`.

## Mental model

- Helper measures current header and measurable body rows.
- It clears any previous lock, waits for Vue DOM flush plus one animation frame, then reads widths.
- It returns pixel widths for a `<colgroup>`.
- Once widths exist, `tableStyle` switches table to `table-layout: fixed`.
- It remeasures on dependency changes and table width changes, not on ordinary scroll.

## Options

- `table`: ref or getter for target `<table>`.
- `dependencies`: values that should trigger a fresh measurement after content changes.
- `disabled`: turn helper off and clear locked widths.

## Return values

- `columnWidths`: measured pixel widths for each column.
- `hasLockedWidths`: `true` once helper has usable widths.
- `tableStyle`: `undefined` before first lock, then `{ tableLayout: 'fixed' }`.
- `scheduleMeasure()`: queue manual remeasurement.
- `clear()`: drop current lock and return table to native auto layout.

## Example

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

const {
  columnWidths,
  tableStyle,
} = useTableColumnWidths({
  table: tableEl,
  dependencies: computed(() => [rows.value.length, filter.value]),
})
</script>

<template>
  <div ref="scrollerEl">
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

## Notes

- Header row comes from last `<thead><tr>`.
- Body measurement ignores `aria-hidden="true"`, `display: none`, invisible, zero-width, and wrong-shape rows.
- If widths need to change after filter, density, or breakpoint updates, put those values in `dependencies`.
- Pair this helper with [headless table demo](../demos/headless-table) when you need full semantic table virtualization.

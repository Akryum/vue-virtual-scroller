<script setup>
import HeadlessTableDocDemo from '../.vitepress/components/demos/HeadlessTableDocDemo.vue'
</script>

# Headless Table Demo

This demo shows the headless dynamic path in a semantic table. It keeps regular `<table>`, `<tbody>`, and `<tr>` markup while measuring row height from the DOM through `useDynamicScroller`.

For smooth headless rendering, treat `pool` as the render source and `visiblePool` as informational only. The example keeps pooled rows mounted, passes the pooled `view` directly into measurement, and lets the directive apply recycled-row positioning and visibility styles automatically.

See also:

- [`useDynamicScroller`](../guide/use-dynamic-scroller) for the full headless dynamic API.
- [`useRecycleScroller`](../guide/use-recycle-scroller) for the fixed-size or pre-sized headless path.

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
import { useDynamicScroller } from 'vue-virtual-scroller'

const MIN_ROW_HEIGHT = 62
const scrollerEl = useTemplateRef<HTMLElement>('scrollerEl')
const dynamicScroller = useDynamicScroller(computed(() => ({
  items: rows.value,
  keyField: 'id',
  direction: 'vertical' as const,
  minItemSize: MIN_ROW_HEIGHT,
  el: scrollerEl.value,
  buffer: buffer.value,
  emitUpdate: true,
})))

const { pool, totalSize, handleScroll, vDynamicScrollerItem } = dynamicScroller
</script>

<template>
  <div
    ref="scrollerEl"
    class="table-viewport"
    @scroll.passive="handleScroll"
  >
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Email</th>
          <th>Region</th>
          <th>Status</th>
        </tr>
      </thead>

      <tbody :style="{ height: `${totalSize}px` }">
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
      </tbody>
    </table>
  </div>
</template>
```

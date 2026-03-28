<script setup>
import HeadlessTableDocDemo from '../.vitepress/components/demos/HeadlessTableDocDemo.vue'
</script>

# Headless Table Demo

Use this demo when you need full control over table markup while keeping the same virtualization engine as `RecycleScroller`, with row heights measured from the actual DOM through `useDynamicScroller`.

For smooth headless rendering, treat `pool` as the render source and `visiblePool` as an informational convenience. The table demo keeps pooled rows mounted, passes the pooled `view` directly into measurement, and lets the directive apply the recycled-row positioning and visibility styles automatically.

See also:

- [`useDynamicScroller`](../guide/use-dynamic-scroller) for the full headless dynamic API.
- [`useRecycleScroller`](../guide/use-recycle-scroller) for the fixed-size or pre-sized headless path.

What to try:

- Type in `Filter` to reduce the dataset without changing the table structure.
- Adjust `Buffer` to see how much render-ahead affects the pooled rows while the heights are measured live.
- Use `Scroll to` and `Jump` to confirm programmatic navigation still works.
- Resize the page to verify the table keeps horizontal overflow usable on smaller screens.

<HeadlessTableDocDemo />


## Relevant source code

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useDynamicScroller } from 'vue-virtual-scroller'

const MIN_ROW_HEIGHT = 62
const scrollerEl = ref<HTMLElement>()
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

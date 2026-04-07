<script setup>
import WindowScrollerDocDemo from '../.vitepress/components/demos/WindowScrollerDocDemo.vue'
</script>

# WindowScroller Demo

In this demo, the browser window is the scroll container. The list stays in normal page flow and follows page scrolling instead of rendering inside an inner scroll panel.

## Try it yourself

- Scroll the page instead of looking for an inner scroll area.
- Jump to a specific row to test `scrollToItem` on the window-scrolling path.
- Toggle variable heights to switch between fixed-size and data-driven rows.
- Expand the intro block, then jump to the same row again to confirm the leading offset stays in sync.

<WindowScrollerDocDemo />

## Source code

```vue
<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'
import { WindowScroller } from 'vue-virtual-scroller'

const scroller = useTemplateRef<InstanceType<typeof WindowScroller>>('scroller')
const rows = ref([
  { id: 1, user: 'Avery Anderson', message: 'Window-driven row', timestamp: '08:00', height: 88 },
  { id: 2, user: 'Jordan Diaz', message: 'Another variable-size row', timestamp: '08:01', height: 116 },
])

function jumpToSecondRow() {
  scroller.value?.scrollToItem(1, { align: 'start' })
}
</script>

<template>
  <WindowScroller
    ref="scroller"
    :items="rows"
    :item-size="null"
    key-field="id"
    size-field="height"
  >
    <template #before>
      <section>Content that stays above the virtual list.</section>
    </template>

    <template #default="{ item }">
      <article :style="{ height: `${item.height}px` }">
        <strong>{{ item.user }}</strong>
        <div>{{ item.message }}</div>
      </article>
    </template>

    <template #after>
      <footer>Content after the virtual list.</footer>
    </template>
  </WindowScroller>
</template>
```

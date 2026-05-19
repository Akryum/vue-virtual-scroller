---
aside: false
outline: false
---

<script setup>
import PageModeDivParentDocDemo from '../.vitepress/components/demos/PageModeDivParentDocDemo.vue'
</script>

# Page-mode with a div scroll-parent

This demo reproduces [issue #928](https://github.com/Akryum/vue-virtual-scroller/issues/928). A `DynamicScroller` with `page-mode` is nested inside a scrollable `<div>` parent. Virtualization clips to that parent's box rather than the browser window.

## Try it yourself

- Scroll inside the green-bordered area — items rendered should match the visible region, not the full window.
- Toggle the explicit `scrollParent` prop checkbox. The component first relies on auto-detection (the nearest `overflow:auto` ancestor); flipping the toggle passes the parent ref explicitly so consumers can bypass the DOM walk in templates with multiple scroll boundaries.

<PageModeDivParentDocDemo />

## Source code

```vue
<script setup>
import { computed, ref } from 'vue'

const items = ref(/* ...your data... */)
const useExplicitScrollParent = ref(false)
const scrollParentEl = ref(null)
const explicitScrollParent = computed(() => (useExplicitScrollParent.value ? scrollParentEl.value : undefined))
</script>

<template>
  <div ref="scrollParentEl" style="height: 300px; overflow: auto">
    <DynamicScroller
      :items="items"
      :min-item-size="54"
      :page-mode="true"
      :scroll-parent="explicitScrollParent"
      key-field="id"
    >
      <template #default="{ item, index, active }">
        <DynamicScrollerItem :item="item" :index="index" :active="active">
          {{ item.message }}
        </DynamicScrollerItem>
      </template>
    </DynamicScroller>
  </div>
</template>
```

# useRecycleScroller (Headless)

`useRecycleScroller` is the low-level composable behind `RecycleScroller`.

Use it when you want full control over markup, styling, and rendering logic while keeping the same virtualization engine.

## When to use this

- You need a custom DOM structure that does not fit the component slot API.
- You want to integrate virtualization into an existing design system component.
- You want to control rendering/pooling behavior directly (for example with custom item wrappers).

If you just need virtual scrolling with standard markup, prefer [`RecycleScroller`](./recycle-scroller).

## Minimal fixed-size example

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRecycleScroller } from 'vue-virtual-scroller'

interface User {
  id: number
  name: string
}

const items = ref<User[]>(
  Array.from({ length: 10000 }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
  })),
)

const scrollerEl = ref<HTMLElement>()

const options = computed(() => ({
  items: items.value,
  keyField: 'id',
  direction: 'vertical' as const,
  itemSize: 40,
  gridItems: undefined,
  itemSecondarySize: undefined,
  minItemSize: null,
  sizeField: 'size',
  typeField: 'type',
  buffer: 200,
  pageMode: false,
  prerender: 0,
  emitUpdate: false,
  updateInterval: 0,
}))

const {
  pool,
  totalSize,
  handleScroll,
} = useRecycleScroller(options, scrollerEl)
</script>

<template>
  <div
    ref="scrollerEl"
    class="my-scroller"
    @scroll.passive="handleScroll"
  >
    <div
      class="my-scroller__inner"
      :style="{ minHeight: `${totalSize}px` }"
    >
      <div
        v-for="view in pool"
        :key="view.nr.id"
        class="my-scroller__item"
        :style="{ transform: `translateY(${view.position}px)` }"
      >
        <strong>#{{ view.nr.index }}</strong> {{ (view.item as User).name }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.my-scroller {
  height: 400px;
  overflow-y: auto;
  position: relative;
  border: 1px solid #ddd;
}

.my-scroller__inner {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.my-scroller__item {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  box-sizing: border-box;
  border-bottom: 1px solid #f0f0f0;
}
</style>
```

## Required options

`useRecycleScroller` expects the same core options used internally by `RecycleScroller`:

- `items`
- `keyField`
- `direction`
- `itemSize`
- `minItemSize`
- `sizeField`
- `typeField`
- `buffer`
- `pageMode`
- `prerender`
- `emitUpdate`
- `updateInterval`

Optional grid options:

- `gridItems`
- `itemSecondarySize`

## Return values you will use most

- `pool`: visible/recycled views to render.
- `totalSize`: full virtual size (wrapper min-height/min-width).
- `handleScroll`: call this on scroll events.
- `scrollToItem(index)`: programmatic navigation.
- `scrollToPosition(px)`: absolute scroll positioning.
- `getScroll()`: current viewport range in pixels.
- `updateVisibleItems(itemsChanged, checkPositionDiff?)`: force recalculation.

## Variable-size mode

Set `itemSize: null` and provide a numeric field on each item (default `sizeField: 'size'`):

```ts
const options = computed(() => ({
  // ...
  itemSize: null,
  minItemSize: 40,
  sizeField: 'size',
}))
```

In this mode, item objects must expose the size field (`item.size` by default).

## Important notes

- You must provide scrollable sizing styles yourself (`height` or `width` + overflow).
- Use a stable key field for object items (default: `id`).
- The composable manages pooling and index mapping, but does not provide built-in markup or CSS.
- If you need automatic unknown-size measurement, use `DynamicScroller`/`DynamicScrollerItem` (or the `useDynamicScroller` + `useDynamicScrollerItem` composables).

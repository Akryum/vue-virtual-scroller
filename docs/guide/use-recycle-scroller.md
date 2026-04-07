# useRecycleScroller (Headless)

`useRecycleScroller` is the low-level composable for building fixed-size or pre-sized virtual lists with your own markup.

Use it when you want full control over markup, styling, and rendering logic while keeping the virtualization engine separate from the rendered UI.

## When to use it

- You need a custom DOM structure that does not fit the component slot API.
- You need a custom DOM structure and direct control over the rendered output.
- You want to integrate virtualization into an existing design system component.
- You want to control rendering/pooling behavior directly (for example with custom item wrappers).
- Item size is already known, fixed, or available in the data before render.

## Mental model

- `useRecycleScroller` is fully headless. It gives you virtualization state, but you still own the wrapper markup, item markup, and positioning styles.
- The scroll container is your element ref (`scrollerEl`). It still needs real scrollable sizing such as a fixed `height` and `overflow`.
- `totalSize` is the virtual size of the full list. Apply it to an inner wrapper, usually with `minHeight` or `minWidth`.
- Render from `pool`, not `visiblePool`, when you want the same recycling behavior as `RecycleScroller`.
- Inactive pooled views stay mounted. Hide them with `visibility: hidden` and `pointer-events: none` instead of removing them from the DOM.

## TypeScript generics

Pass the item type as the generic parameter when you want typed pool entries and compile-time validation for object-item fields:

```ts
const recycleScroller = useRecycleScroller<User>({
  items: users.value,
  keyField: 'id',
  direction: 'vertical',
  itemSize: null,
  minItemSize: 32,
  sizeField: 'size',
  typeField: 'type',
  buffer: 200,
  pageMode: false,
  prerender: 0,
  emitUpdate: false,
  updateInterval: 0,
}, scrollerEl)

recycleScroller.pool.value[0]?.item.name
```

When `TItem` is an object type, `keyField` must be a string key on that type, and `sizeField` must be a numeric field when `itemSize` is `null`.

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

Additional scroll-system options:

- `shift`
- `cache`

## Return values you will use most

- `pool`: the render-ready set of pooled views. This is the main render source when you want the smoothest recycling behavior.
- `visiblePool`: `pool` filtered to active views and sorted by visible index order. Useful for readouts, debugging, or simple derived UI.
- `totalSize`: full virtual size (wrapper min-height/min-width).
- `handleScroll`: call this on scroll events.
- `scrollToItem(index, options?)`: programmatic navigation with `align`, `smooth`, and `offset`.
- `scrollToPosition(px, options?)`: absolute scroll positioning.
- `getScroll()`: current viewport range in pixels.
- `findItemIndex(offset)`: resolve a pixel offset back to an item index.
- `getItemOffset(index)`: read the starting pixel offset for an item.
- `getItemSize(index)`: read the known size for an item.
- `cacheSnapshot`: current serializable size snapshot.
- `restoreCache(snapshot)`: restore a previous snapshot when the item sequence matches.
- `updateVisibleItems(itemsChanged, checkPositionDiff?)`: force recalculation.

## Render checklist

- Give the outer scroller a fixed size and overflow behavior.
- Add an inner wrapper with `position: relative` and `minHeight`/`minWidth` from `totalSize`.
- Render every entry in `pool`.
- Absolutely position each rendered view yourself.
- Hide inactive views instead of filtering them out.

## Common pitfalls

- You must provide scrollable sizing styles yourself (`height` or `width` + overflow).
- Use a stable key field for object items (default: `id`).
- The composable manages pooling and index mapping, but does not provide built-in markup or CSS.
- Render from `pool` and hide inactive views instead of filtering them out if you want to preserve DOM reuse.
- If item size has to be measured from the DOM after render, use [`useDynamicScroller`](./use-dynamic-scroller) instead.
- If the browser window owns scrolling, use [`useWindowScroller`](./use-window-scroller) instead of reproducing page-mode behavior yourself.

## Full example

```vue
<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue'
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

const scrollerEl = useTemplateRef<HTMLElement>('scrollerEl')

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
      <!-- In the headless fixed-size path, you apply recycled-view styles yourself. -->
      <div
        v-for="view in pool"
        :key="view.nr.id"
        class="my-scroller__item"
        :style="{
          transform: `translateY(${view.position}px)`,
          visibility: view.nr.used ? 'visible' : 'hidden',
          pointerEvents: view.nr.used ? undefined : 'none',
        }"
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

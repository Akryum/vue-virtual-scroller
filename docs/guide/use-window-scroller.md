# useWindowScroller (Headless Window Scrolling)

`useWindowScroller` is the headless composable for virtual lists that follow browser window scrolling.

Use it when the browser viewport should drive virtualization, but you still need full control over markup, wrappers, and styling.

## When to use it

- The page itself scrolls, not an inner fixed-height container.
- You need custom markup in normal page flow.
- You still want pooled rendering, scroll helpers, `shift`, and cache restore on the window-scrolling path.

## Mental model

- `useWindowScroller` is `useRecycleScroller` with `pageMode` forced on.
- Your root `el` stays in normal page flow. It should not become the scrolling element.
- `pool` is still the render source when you want the usual DOM reuse behavior.
- `totalSize` still belongs on an inner wrapper so the virtual extent matches the whole list.
- You can provide optional `before` and `after` refs when leading or trailing page content should be included in the virtual offset math.

## TypeScript generics

`useWindowScroller` accepts the same generic item parameter as `useRecycleScroller`, so the returned pool and helper methods stay item-aware:

```ts
const windowScroller = useWindowScroller<Row>({
  items: rows.value,
  keyField: 'id',
  direction: 'vertical',
  itemSize: 44,
  minItemSize: null,
  sizeField: 'size',
  typeField: 'type',
  buffer: 200,
  prerender: 0,
  emitUpdate: false,
  updateInterval: 0,
}, rootEl)

windowScroller.pool.value[0]?.item.label
```

For object items, `keyField` and variable-size `sizeField` follow the same compile-time checks as `useRecycleScroller`.

## Required inputs

`useWindowScroller(options, el, before?, after?)`

- `options`: same core options as [`useRecycleScroller`](./use-recycle-scroller), except `pageMode` is always treated as `true`
- `el`: ref for the root scroller element in page flow
- `before`: optional ref for content rendered before the virtual list inside the same root
- `after`: optional ref for content rendered after the virtual list inside the same root

Common options:

- `items`
- `keyField`
- `direction`
- `itemSize`
- `minItemSize`
- `sizeField`
- `typeField`
- `buffer`
- `shift`
- `cache`
- `prerender`
- `emitUpdate`
- `updateInterval`

## Return values you will use most

- `pool`: render-ready pooled views
- `visiblePool`: active views in visible index order
- `totalSize`: virtual size for the inner wrapper
- `handleScroll`: available for symmetry, but the composable already listens to the window/page scroll target in page mode
- `scrollToItem(index, options?)`: jump to a logical item index with `align`, `smooth`, and `offset`
- `scrollToPosition(px, options?)`: scroll the page to an absolute list offset
- `getScroll()`: current viewport range intersected with this list
- `findItemIndex(offset)`: resolve a pixel offset back to an item index
- `getItemOffset(index)`: read the starting pixel offset for an item
- `getItemSize(index)`: read the known size for an item
- `cacheSnapshot`: current serializable size snapshot
- `restoreCache(snapshot)`: restore a previous snapshot when the item sequence matches
- `updateVisibleItems(itemsChanged, checkPositionDiff?)`: force recalculation

## Render checklist

- Keep the outer root in page flow.
- Add an inner wrapper with `position: relative` and `minHeight` or `minWidth` from `totalSize`.
- Render every entry in `pool`.
- Absolutely position each pooled view yourself.
- Hide inactive views instead of filtering them out.

## Common pitfalls

- Do not give the root element a fixed scrolling height if the page is supposed to own scrolling.
- `pageMode` is already built in here. Do not try to layer separate page-mode logic on top.
- Render from `pool`, not `visiblePool`, when you want the usual recycling behavior.
- If item sizes must be measured from the DOM after render, use [`useDynamicScroller`](./use-dynamic-scroller) instead.
- `before` and `after` refs matter when surrounding content inside the root changes the list's effective offset.

## Full example

```vue
<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue'
import { useWindowScroller } from 'vue-virtual-scroller'

interface Row {
  id: number
  label: string
}

const rows = ref<Row[]>(
  Array.from({ length: 2000 }, (_, index) => ({
    id: index + 1,
    label: `Row ${index + 1}`,
  })),
)

const rootEl = useTemplateRef<HTMLElement>('rootEl')
const beforeEl = useTemplateRef<HTMLElement>('beforeEl')
const afterEl = useTemplateRef<HTMLElement>('afterEl')

const {
  pool,
  totalSize,
  scrollToItem,
} = useWindowScroller(computed(() => ({
  items: rows.value,
  keyField: 'id',
  direction: 'vertical' as const,
  itemSize: 44,
  minItemSize: null,
  sizeField: 'size',
  typeField: 'type',
  buffer: 200,
  shift: false,
  prerender: 0,
  emitUpdate: false,
  updateInterval: 0,
})), rootEl, beforeEl, afterEl)
</script>

<template>
  <section ref="rootEl" class="window-list">
    <header ref="beforeEl" class="window-list__intro">
      <button @click="scrollToItem(500, { align: 'start', smooth: true })">
        Jump to row 501
      </button>
    </header>

    <div class="window-list__inner" :style="{ minHeight: `${totalSize}px` }">
      <div
        v-for="view in pool"
        :key="view.nr.id"
        class="window-list__row"
        :style="{
          transform: `translateY(${view.position}px)`,
          visibility: view.nr.used ? 'visible' : 'hidden',
          pointerEvents: view.nr.used ? undefined : 'none',
        }"
      >
        {{ (view.item as Row).label }}
      </div>
    </div>

    <footer ref="afterEl" class="window-list__outro">
      End of virtualized content
    </footer>
  </section>
</template>

<style scoped>
.window-list__inner {
  position: relative;
}

.window-list__row {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 44px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  box-sizing: border-box;
  border-bottom: 1px solid #eee;
}
</style>
```

## Related guides

- [`useRecycleScroller`](./use-recycle-scroller) for headless lists inside their own scroll container
- [`useDynamicScroller`](./use-dynamic-scroller) for unknown-size headless items

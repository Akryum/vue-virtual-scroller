# useDynamicScroller (Headless Dynamic Items)

`useDynamicScroller` is the headless composable for virtual lists whose item size must be measured after render.

Use it when you need custom markup, but item size still has to be measured from the DOM after render.

## When to use it

- You need semantic markup such as table rows, list items, or design-system wrappers.
- Item height or width is not known ahead of time.
- You still want pooled rendering and DOM reuse instead of rendering every visible item from scratch.
- You need dynamic measurement without relying on bundled wrapper markup.

## Mental model

- `useDynamicScroller` combines two concerns:
  - `useRecycleScroller` for pooled rendering, scroll math, and virtualization state
  - `vDynamicScrollerItem` for per-item size measurement
- You render from `pool`.
- Each `view` inside `pool` wraps an internal `ItemWithSize`, so the original item lives at `view.item.item`.
- `totalSize` still belongs on your inner wrapper.
- When you bind `v-dynamic-scroller-item="{ view, ... }"`, the directive:
  - derives `item`, `active`, and `index` from the pooled view
  - measures the DOM element for unknown-size updates
  - applies recycled-view positioning and visibility styles automatically
  - uses `top` positioning for table rows and transforms for generic elements

## TypeScript generics

Pass the item type as the generic parameter when you want typed headless helpers and strict `item` inputs:

```ts
const dynamicScroller = useDynamicScroller<Message>({
  items: messages.value,
  keyField: 'id',
  direction: 'vertical',
  minItemSize: 48,
  el: scrollerEl,
})

dynamicScroller.pool.value[0]?.item.item.text
dynamicScroller.getItemSize(messages.value[0])
```

The same declared type also flows into `useDynamicScrollerItem<TItem>()` when you use the lower-level measurement helper directly.

## Directive contract

Use the directive with the pooled `view`:

```vue
v-dynamic-scroller-item="{
  view,
  sizeDependencies: [...],
}"
```

Supported binding fields:

- `view`: required in the recommended headless path
- `sizeDependencies`: values that can change rendered size
- `watchData`: deep-watch fallback, usually not recommended
- `emitResize`: emit resize callbacks when measurement changes
- `onResize`: optional callback for resize notifications

In the recommended `view`-based path, you do not need to pass `item`, `active`, `index`, or per-item positioning styles manually.

## Return values you will use most

- `pool`: render-ready pooled views. This is the main render source.
- `visiblePool`: active views in visible index order. Useful for readouts, debugging, or derived UI state.
- `totalSize`: virtual size for the inner wrapper.
- `handleScroll`: call this on the scroll container.
- `scrollToItem(index, options?)`: jump to a logical item index with `align`, `smooth`, and `offset`.
- `scrollToPosition(px, options?)`: scroll to an absolute pixel offset.
- `findItemIndex(offset)`: resolve a pixel offset back to an item index.
- `getItemOffset(index)`: read the known starting offset for an item.
- `getItemSize(item, index?)`: read the measured size for an item.
- `cacheSnapshot`: current serializable size snapshot.
- `restoreCache(snapshot)`: restore previously known sizes when the item sequence matches.
- `forceUpdate(clear?)`: trigger a recalculation, optionally clearing known sizes.

## Render checklist

- Give the outer scroller a fixed size and overflow behavior.
- Add an inner wrapper with `position: relative` and `minHeight`/`minWidth` from `totalSize`.
- Render every entry in `pool`.
- Bind the pooled `view` into `v-dynamic-scroller-item`.
- Pass `sizeDependencies` for data that can change layout after first render.

## Common pitfalls

- Forgetting `minItemSize` hurts the initial layout and scroll math.
- Rendering from `visiblePool` instead of `pool` reduces the effectiveness of DOM reuse.
- Forgetting `sizeDependencies` means content changes may not trigger remeasurement.
- Reading `view.item` as if it were the original item can be confusing in headless mode. The original row lives at `view.item.item`.
- `watchData` works, but it is heavier than targeted `sizeDependencies`.
- If you prepend into chat-style data, enable `shift` in the composable options so the viewport stays anchored.

## Full example

```vue
<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue'
import { useDynamicScroller } from 'vue-virtual-scroller'

const rows = ref([
  { id: 1, title: 'Alpha', body: 'Unknown-size content' },
  { id: 2, title: 'Beta', body: 'This row can wrap and grow' },
])

const scrollerEl = useTemplateRef<HTMLElement>('scrollerEl')

const {
  pool,
  totalSize,
  handleScroll,
  vDynamicScrollerItem,
} = useDynamicScroller(computed(() => ({
  items: rows.value,
  keyField: 'id',
  direction: 'vertical' as const,
  minItemSize: 48,
  el: scrollerEl.value,
})))
</script>

<template>
  <div
    ref="scrollerEl"
    class="scroller"
    @scroll.passive="handleScroll"
  >
    <div :style="{ minHeight: `${totalSize}px`, position: 'relative' }">
      <article
        v-for="view in pool"
        :key="view.nr.id"
        v-dynamic-scroller-item="{
          view,
          sizeDependencies: [view.item.item.title, view.item.item.body],
        }"
      >
        <h4>{{ view.item.item.title }}</h4>
        <p>{{ view.item.item.body }}</p>
      </article>
    </div>
  </div>
</template>
```

## Related guides

- [`useRecycleScroller`](./use-recycle-scroller) for fixed-size or pre-sized headless lists
- [`useWindowScroller`](./use-window-scroller) for headless window-based virtualization
- [Headless table demo](../demos/headless-table) for a semantic table example

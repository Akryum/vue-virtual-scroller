# WindowScroller

`WindowScroller` is the window-based version of [`RecycleScroller`](./recycle-scroller).

Use it when the browser window is the scroll container and the list should stay in normal page flow with content above or below it.

## When to use it

- The page itself scrolls, not an inner fixed-height container.
- You want a documented public API for window scrolling instead of relying on `pageMode`.
- You still want the same pooled rendering, `shift`, cache restore, and imperative scrolling helpers as `RecycleScroller`.

## Basic usage

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { WindowScroller } from 'vue-virtual-scroller'

const rows = ref(
  Array.from({ length: 1000 }, (_, index) => ({
    id: index + 1,
    label: `Row ${index + 1}`,
  })),
)
</script>

<template>
  <section class="page-content-before">
    Content before the list
  </section>

  <WindowScroller
    v-slot="{ item }"
    :items="rows"
    :item-size="40"
    key-field="id"
  >
    <div class="row">
      {{ item.label }}
    </div>
  </WindowScroller>
</template>
```

## TypeScript generics

`WindowScroller` uses the same generic component typing as `RecycleScroller`. With Vue 3.3+, the `item` slot prop is inferred from `items` automatically:

```vue
<script setup lang="ts">
import { ref } from 'vue'

interface Row {
  id: number
  label: string
}

const rows = ref<Row[]>([])
</script>

<template>
  <WindowScroller :items="rows" :item-size="40">
    <template #default="{ item }">
      {{ item.label }}
    </template>
  </WindowScroller>
</template>
```

If you want the same item type to flow through the headless window-scrolling helpers, use [`useWindowScroller`](./use-window-scroller) with an explicit generic.

## How it behaves

- The list stays in normal page flow instead of owning its own fixed-height scrollbox.
- Visibility is computed from the browser viewport, so surrounding page content can sit before or after the list naturally.
- The component still uses pooled rendering, recycled views, `shift`, and cache restore exactly like `RecycleScroller`.

## Props

`WindowScroller` accepts the same core props as [`RecycleScroller`](./recycle-scroller#props), except it always uses window-based scrolling.

The most commonly used props are:

- `items`
- `keyField`
- `direction`
- `itemSize`
- `gridItems`
- `itemSecondarySize`
- `minItemSize`
- `sizeField`
- `typeField`
- `buffer`
- `shift`
- `cache`
- `prerender`
- `emitUpdate`
- `updateInterval`
- `listTag`
- `itemTag`
- `listClass`
- `itemClass`

Use `itemSize: null` when each item already knows its size through `sizeField`. If the DOM needs to measure unknown item sizes after render, switch to [`DynamicScroller`](./dynamic-scroller).

## Slots

`WindowScroller` keeps the same slot structure as `RecycleScroller`:

- Default slot props: `item`, `index`, `active`
- `before`: content rendered before the pooled list
- `after`: content rendered after the pooled list
- `empty`: shown when `items` is empty

The default slot is still the simplest choice when the bundled wrapper markup already fits your UI.

## Events

`WindowScroller` emits the same events as `RecycleScroller`:

- `resize`
- `visible`
- `hidden`
- `update(startIndex, endIndex, visibleStartIndex, visibleEndIndex)` when `emitUpdate` is enabled

## Exposed methods

With a template ref created via `useTemplateRef`, `WindowScroller` exposes the same navigation helpers as the core scroller:

- `scrollToItem(index, options?)`
- `scrollToPosition(position, options?)`
- `getScroll()`
- `findItemIndex(offset)`
- `getItemOffset(index)`
- `getItemSize(index)`
- `cacheSnapshot`
- `restoreCache(snapshot)`
- `updateVisibleItems(itemsChanged, checkPositionDiff?)`

## `WindowScroller` vs `pageMode`

- Prefer `WindowScroller` for new code when window scrolling is intentional.
- Keep using `pageMode` on `RecycleScroller` when you only need the older compatibility behavior and do not want to switch components yet.

# RecycleScroller

Scope: the main component for fixed-size and pre-sized virtualization, including grids, prepend anchoring, cache restore, and native-flow rendering.

## Provenance

Generated from the package's public component documentation and shipped demo patterns at skill generation time.

## When to use

- Item height or width is fixed.
- Each item already exposes a numeric size field.
- Item size can be derived in memory through an `itemSize(item, index)` resolver.
- You need grid rendering with fixed item dimensions.
- You want component API ergonomics instead of a headless render loop.

## Required inputs

- `items`
- A stable scroller size in CSS
- `itemSize` as a fixed number, `null` plus `sizeField`, or a resolver function
- `keyField` when object items do not use `id`

## Core props/options

Common props:

- `items`
- `direction`
- `itemSize`
- `keyField`
- `typeField` (default `'type'`) to keep one recycled pool per item kind
- `buffer`
- `prerender`
- `shift`
- `cache`
- `disableTransform`
- `itemsLimit` (default `1000`) for a positive per-instance rendered-view safety limit override

Mode-specific props:

- `sizeField` for `itemSize: null`
- `gridItems`
- `itemSecondarySize`
- `minItemSize` when some pre-sized values may be missing initially
- `flowMode` for vertical single-axis native-flow rendering with spacer elements
- `enabled` (default `true`): pass `:enabled="false"` to mount the scroller
  passively. No watchers, observers, scroll/resize listeners, or RAFs run; the
  pool stays empty. Toggle back to `true` to re-arm without remounting.

Documented behavior:

- `itemSize` accepts a fixed number, `null`, or `(item, index) => number`
- `gridItems` still requires a fixed numeric `itemSize`
- sparse two-axis grids apply `itemsLimit` to actual rendered views, not the flattened index span
- `pageMode` still exists, but new code should prefer `WindowScroller` for page scrolling
- `flowMode` keeps active pooled views in DOM order and inserts spacer elements before and after the active window

## Events/returns

Documented events:

- `resize`
- `visible`
- `hidden`
- `scroll-start`
- `scroll-end`
- `update(startIndex, endIndex, visibleStartIndex, visibleEndIndex)` when `emitUpdate` is `true`

Documented slot props and helpers:

- default slot: `item`, `index`, `active`
- named slots: `before`, `after`, `empty`
- exposed helpers: `scrollToItem`, `scrollToPosition`, `findItemIndex`, `getItemOffset`, `getItemSize`, `startSpacerSize`, `endSpacerSize`, `cacheSnapshot`, `restoreCache`, `updateVisibleItems`

## Pitfalls

- Size the scroller element and item elements correctly with CSS.
- Recycled child components must respond when `item` changes.
- If the slot renders different components per item kind, set `typeField` to the kind field. Without it, reused views switch kinds and remount their entire row subtree.
- Define `itemSize` resolvers once instead of inline; a recreated resolver is re-run over every item.
- Avoid reading scroll-dependent parent state inside the default slot; every visible view re-renders when it changes.
- Track per-row hover/active/selected state per item (a `reactive(new Set())` mutated in place), not a collection rebuilt on each change that every row reads.
- Read scroll geometry in the scroll event handler, not in watchers, rAF callbacks or the `update` handler, which run after the DOM was patched and force a synchronous layout.
- Key pinned or sticky copies of rows rendered outside the scroller by slot, not by item id, so changes patch instead of remounting.
- Functional components are usually a bad fit inside recycled views.
- Key nested images, but not the immediate recycled row shell.
- Do not key nested components by item id; reuse then remounts them and re-runs `onMounted` work such as fetches on every scrolled row.
- Use the provided `hover` class instead of raw `:hover` selectors on recycled nodes.
- Variable-size mode is heavier than fixed-size mode.
- `flowMode` is intentionally limited in v1 to vertical single-axis layouts. `gridItems`, horizontal mode, and `hiddenPosition` fall back to standard positioning.

## Example patterns

Fixed-size rows:

```vue
<RecycleScroller
  v-slot="{ item }"
  :items="rows"
  :item-size="40"
  key-field="id"
>
  <div class="row">
    {{ item.label }}
  </div>
</RecycleScroller>
```

Resolver-based size (defined once, not inline):

```vue
<script setup lang="ts">
function rowSize(item: Row) {
  return item.compact ? 40 : 56
}
</script>

<template>
  <RecycleScroller
    :items="rows"
    :item-size="rowSize"
    key-field="id"
  >
    <template #default="{ item }">
      {{ item.label }}
    </template>
  </RecycleScroller>
</template>
```

Mixed item kinds:

```vue
<RecycleScroller
  :items="rows"
  :item-size="32"
  type-field="kind"
>
  <template #default="{ item }">
    <GroupHeader v-if="item.kind === 'group'" :group="item" />
    <FileRow v-else :file="item" />
  </template>
</RecycleScroller>
```

Grid layout:

```vue
<RecycleScroller
  :items="cards"
  :item-size="166"
  :grid-items="5"
  :item-secondary-size="176"
>
  <template #default="{ item }">
    <article>{{ item.name }}</article>
  </template>
</RecycleScroller>
```

Flow mode:

```vue
<RecycleScroller
  v-slot="{ item }"
  :items="rows"
  :item-size="40"
  :flow-mode="true"
  key-field="id"
>
  <article class="row">
    {{ item.label }}
  </article>
</RecycleScroller>
```

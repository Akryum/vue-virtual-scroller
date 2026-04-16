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
- `buffer`
- `prerender`
- `shift`
- `cache`
- `disableTransform`

Mode-specific props:

- `sizeField` for `itemSize: null`
- `gridItems`
- `itemSecondarySize`
- `minItemSize` when some pre-sized values may be missing initially
- `flowMode` for vertical single-axis native-flow rendering with spacer elements

Documented behavior:

- `itemSize` accepts a fixed number, `null`, or `(item, index) => number`
- `gridItems` still requires a fixed numeric `itemSize`
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
- Functional components are usually a bad fit inside recycled views.
- Key nested images, but not the immediate recycled row shell.
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

Resolver-based size:

```vue
<RecycleScroller
  :items="rows"
  :item-size="(item, index) => item.compact ? 40 : 56"
  key-field="id"
>
  <template #default="{ item }">
    {{ item.label }}
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

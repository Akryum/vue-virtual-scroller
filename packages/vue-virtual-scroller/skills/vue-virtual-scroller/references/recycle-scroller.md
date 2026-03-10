# RecycleScroller

Scope: the main component for virtualizing fixed-size lists, pre-sized variable lists, grids, and page-level scrolling.

## Provenance

Generated from the package's public component documentation and shipped demo patterns at skill generation time.

## When to use

- Item height or width is fixed.
- Each item already exposes a numeric size field and you want variable-size mode without DOM measurement.
- You need grid rendering with fixed item dimensions.
- You want page mode or SSR prerender support through the component API.

## Required inputs

- `items`
- A stable scroller size in CSS.
- `itemSize` for fixed-size mode, or `itemSize: null` plus a numeric size field for variable-size mode.
- `keyField` when object items do not use `id`.

## Core props/options

Common props:

- `items`
- `direction`
- `itemSize`
- `keyField`
- `buffer`
- `pageMode`
- `prerender`

Variable-size mode:

- `itemSize: null`
- `sizeField`
- `minItemSize` for unknown item sizes before they are fully known

Grid mode:

- `gridItems`
- `itemSecondarySize`

Other documented props:

- `typeField`
- `emitUpdate`
- `updateInterval`
- `listClass`
- `itemClass`
- `listTag`
- `itemTag`

## Events/returns

Documented events:

- `resize`
- `visible`
- `hidden`
- `update(startIndex, endIndex, visibleStartIndex, visibleEndIndex)` when `emitUpdate` is enabled
- `scroll-start`
- `scroll-end`

Default slot props:

- `item`
- `index`
- `active`

Named slots:

- `before`
- `empty`
- `after`

## Pitfalls

- The scroller element and item elements must be sized correctly with CSS.
- Do not use functional components in recycled views when performance matters.
- Child components must respond to `item` changing because views are reused.
- Nested images should still receive keys to avoid load glitches.
- Use the `hover` class rather than raw `:hover` selectors on recycled nodes.
- Browser element-size limits make extremely large lists impractical.
- Variable-size mode can become expensive with many items.

## Example patterns

Fixed-size rows:

```vue
<RecycleScroller
  v-slot="{ item }"
  :items="list"
  :item-size="32"
  key-field="id"
>
  <div class="row">
    {{ item.name }}
  </div>
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

Page mode:

```vue
<RecycleScroller
  :items="items"
  :item-size="42"
  page-mode
/>
```

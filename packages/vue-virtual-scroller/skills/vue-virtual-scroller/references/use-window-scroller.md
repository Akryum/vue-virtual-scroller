# useWindowScroller

Scope: the headless composable for virtual lists that follow browser window scrolling.

## Provenance

Generated from the package's public headless window-scrolling documentation at skill generation time.

## When to use

- The page itself scrolls, not an inner fixed-height container.
- You need custom markup in normal page flow.
- You still want pooled rendering, scroll helpers, and cache restore.

## Required inputs

- `options`
- `options.el` for the root element in page flow
- optional `options.before` and `options.after` refs when surrounding content should be included in offset math

Common options:

- `items`
- `keyField`
- `direction` (optional, defaults to `'vertical'`)
- `itemSize`
- `minItemSize`
- `sizeField`
- `typeField`
- `buffer`
- `shift`
- `cache`
- `disableTransform`

## Core props/options

Documented behavior:

- `useWindowScroller` is the headless window-scrolling path for this package
- render from `pool`
- keep the outer root in normal page flow
- put `totalSize` on an inner wrapper
- `itemSize` can be a fixed number, `null`, or `(item, index) => number`

## Events/returns

Returns used most often:

- `pool`
- `visiblePool`
- `totalSize`
- `scrollToItem`
- `scrollToPosition`
- `getScroll`
- `findItemIndex`
- `getItemOffset`
- `getItemSize`
- `getViewStyle`
- `cacheSnapshot`
- `restoreCache`
- `updateVisibleItems`

## Pitfalls

- Do not turn the root into its own scrolling container.
- Render from `pool`, not `visiblePool`, when you want normal recycling behavior.
- If item size must be measured from the DOM, move to `useDynamicScroller`.
- `before` and `after` refs matter when surrounding content inside the root changes the list's effective offset.

## Example patterns

Headless page-scrolling list:

```vue
<section ref="rootEl">
  <div :style="{ minHeight: `${totalSize}px`, position: 'relative' }">
    <div
      v-for="view in pool"
      :key="view.nr.id"
      :style="getViewStyle(view)"
    >
      {{ (view.item as Row).label }}
    </div>
  </div>
</section>
```

```ts
const state = useWindowScroller({
  items: rows,
  el: rootEl,
  keyField: 'id',
  itemSize: 48,
  minItemSize: null,
  sizeField: 'size',
  typeField: 'type',
  buffer: 200,
  prerender: 0,
  emitUpdate: false,
  updateInterval: 0,
})
```

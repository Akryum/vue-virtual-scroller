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
- `el` for the root element in page flow
- optional `before` and `after` refs when surrounding content should be included in offset math

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

- `useWindowScroller` is the headless `pageMode` path with window scrolling built in
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
- `pageMode` logic is already built in here; do not reimplement it.
- Render from `pool`, not `visiblePool`, when you want normal recycling behavior.
- If item size must be measured from the DOM, move to `useDynamicScroller`.

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

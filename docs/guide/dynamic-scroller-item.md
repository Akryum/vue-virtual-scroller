# DynamicScrollerItem

`DynamicScrollerItem` is the measurement wrapper used inside [DynamicScroller](./dynamic-scroller). It watches each rendered item and reports size changes back to the scroller.

## Props

| Prop | Default | Description |
|------|---------|-------------|
| `item` (required) | — | The item rendered in the scroller. |
| `active` (required) | — | Whether the current item is active. When it is inactive, unnecessary size recomputation is skipped. |
| `index` | — | Item index. Required when `DynamicScroller` uses simple-array mode or a function `keyField`. Optional for object items with a string `keyField` such as the default `'id'`. |
| `sizeDependencies` | — | Values that can affect the size of the item. This prop will be watched and if one value changes, the size will be recomputed. Recommended instead of `watchData`. |
| `watchData` | `false` | Deeply watch `item` for changes to re-calculate the size (not recommended, can impact performance). |
| `tag` | `'div'` | Element used to render the component. |
| `emitResize` | `false` | Emit the `resize` event each time the size is recomputed (can impact performance). |

## Usage notes

- `DynamicScrollerItem` identifies measurements from `item` plus scroller `keyField`, not from debug DOM attributes such as `data-index`.
- When `index` is required, pass slot `index` directly: `:index="index"`.

## Events

| Event | Description |
|-------|-------------|
| `resize` | Emitted each time the size is recomputed, only if `emitResize` prop is `true`. |

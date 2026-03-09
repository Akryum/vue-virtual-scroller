# DynamicScrollerItem

The component that should wrap all the items in a [DynamicScroller](./dynamic-scroller) to handle size computations.

## Props

| Prop | Default | Description |
|------|---------|-------------|
| `item` (required) | — | The item rendered in the scroller. |
| `active` (required) | — | Is the holding view active in RecycleScroller. Will prevent unnecessary size recomputation. |
| `sizeDependencies` | — | Values that can affect the size of the item. This prop will be watched and if one value changes, the size will be recomputed. Recommended instead of `watchData`. |
| `watchData` | `false` | Deeply watch `item` for changes to re-calculate the size (not recommended, can impact performance). |
| `tag` | `'div'` | Element used to render the component. |
| `emitResize` | `false` | Emit the `resize` event each time the size is recomputed (can impact performance). |

## Events

| Event | Description |
|-------|-------------|
| `resize` | Emitted each time the size is recomputed, only if `emitResize` prop is `true`. |

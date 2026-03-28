# DynamicScrollerItem

The default component wrapper for items in a [DynamicScroller](./dynamic-scroller) to handle size computations.

If you need the same measurement behavior without rendering a wrapper component, use the headless `vDynamicScrollerItem` directive returned by [`useDynamicScroller`](./dynamic-scroller#headless-usage). That directive accepts the pooled `view` directly, derives `item`, `active`, and `index` from it for you, and applies the recycled-view positioning and visibility styles automatically.

For the full headless dynamic workflow, including `pool`, `totalSize`, and the render contract around `vDynamicScrollerItem`, see [`useDynamicScroller`](./use-dynamic-scroller).

## Headless Equivalent

The component and the directive share the same measurement behavior, but the headless directive starts from the recycled `view` instead of individual props:

```vue
<article
  v-dynamic-scroller-item="{
    view,
    sizeDependencies: [view.item.item.message],
  }"
>
  {{ view.item.item.message }}
</article>
```

Use the component when the bundled wrapper markup is acceptable. Use the directive when you need semantic table rows, design-system wrappers, or any other DOM structure the component cannot provide directly.

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

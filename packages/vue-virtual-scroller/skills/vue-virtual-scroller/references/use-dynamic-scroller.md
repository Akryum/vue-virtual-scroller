# useDynamicScroller

Scope: the headless composable for unknown-size virtual lists that must measure item size after render.

## Provenance

Generated from the package's public headless dynamic-sizing documentation at skill generation time.

## When to use

- You need custom markup or semantics such as table rows.
- Item height or width is not known ahead of time.
- You still want pooled rendering and DOM reuse.

## Required inputs

- `items`
- `keyField`
- `direction` (optional, defaults to `'vertical'`)
- `minItemSize`
- `el` for the scroll container

Recommended dynamic inputs:

- `sizeDependencies` through `vDynamicScrollerItem`
- `shift` for prepend-heavy histories
- `disableTransform` when pooled wrappers must avoid transforms
- `flowMode` when active views should stay in native block or table flow

## Core props/options

Documented mental model:

- `useDynamicScroller` combines pooled virtualization with per-item measurement
- render from `pool`
- `view.item` is the original row for ordinary rendering
- `view.itemWithSize` keeps measured metadata
- `startSpacerSize` and `endSpacerSize` expose the spacer sizes needed by `flowMode`
- `getViewStyle(view)` exposes pooled positioning styles for custom integrations

Supported directive binding fields:

- `view`
- `sizeDependencies`
- `watchData`
- `emitResize`
- `onResize`

## Events/returns

Returns used most often:

- `pool`
- `visiblePool`
- `totalSize`
- `startSpacerSize`
- `endSpacerSize`
- `scrollToItem`
- `scrollToPosition`
- `findItemIndex`
- `getItemOffset`
- `getItemSize(item, index?)`
- `getViewStyle`
- `cacheSnapshot`
- `restoreCache`
- `forceUpdate`
- `vDynamicScrollerItem`

## Pitfalls

- Forgetting `minItemSize` hurts initial layout and scroll math.
- Rendering from `visiblePool` instead of `pool` reduces DOM reuse.
- Forgetting `sizeDependencies` means content changes may not trigger remeasurement.
- `watchData` is heavier than targeted `sizeDependencies`.
- Use `view.item` for rendering. Reach for `view.itemWithSize` only when you need measured metadata.
- `flowMode` only supports vertical single-axis layouts in v1. It is meant for native block or table flow, not grids or horizontal virtualization.
- If you render a semantic table in `flowMode`, pair it with [`useTableColumnWidths`](./use-table-column-widths.md) so column widths stay locked while pooled rows churn.

## Example patterns

Wrapper-free dynamic rows:

```vue
<article
  v-for="view in pool"
  :key="view.id"
  v-dynamic-scroller-item="{
    view,
    sizeDependencies: [view.item.body],
  }"
>
  {{ view.item.body }}
</article>
```

Flow-mode spacers for semantic tables:

```vue
<tbody>
  <tr v-if="startSpacerSize > 0" aria-hidden="true">
    <td :style="{ height: `${startSpacerSize}px` }" />
  </tr>
  <tr
    v-for="view in pool"
    :key="view.id"
    v-dynamic-scroller-item="{ view }"
  >
    <td>{{ view.item.label }}</td>
  </tr>
  <tr v-if="endSpacerSize > 0" aria-hidden="true">
    <td :style="{ height: `${endSpacerSize}px` }" />
  </tr>
</tbody>
```

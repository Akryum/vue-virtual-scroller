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
- `direction`
- `minItemSize`
- `el` for the scroll container

Recommended dynamic inputs:

- `sizeDependencies` through `vDynamicScrollerItem`
- `shift` for prepend-heavy histories
- `disableTransform` when pooled wrappers must avoid transforms

## Core props/options

Documented mental model:

- `useDynamicScroller` combines pooled virtualization with per-item measurement
- render from `pool`
- the original row lives at `view.item.item`
- bind `vDynamicScrollerItem` with the pooled `view`

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
- `handleScroll`
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
- `watchData` is heavier than targeted dependencies.
- `view.item` is an internal item-with-size wrapper, not the original item.

## Example patterns

Wrapper-free dynamic rows:

```vue
<article
  v-for="view in pool"
  :key="view.nr.id"
  v-dynamic-scroller-item="{
    view,
    sizeDependencies: [view.item.item.body],
  }"
>
  {{ view.item.item.body }}
</article>
```

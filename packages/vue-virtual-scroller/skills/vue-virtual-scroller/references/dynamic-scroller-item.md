# DynamicScrollerItem

Scope: the per-item measurement wrapper used inside `DynamicScroller`.

When wrapper-free markup is required, prefer the headless `vDynamicScrollerItem` directive returned by `useDynamicScroller`.

## Provenance

Generated from the package's public dynamic-item documentation and shipped demo patterns at skill generation time.

## When to use

- You are rendering an item inside `DynamicScroller`.
- Rendered content can change size after first render.
- The wrapper component fits your markup.

## Required inputs

- `item`
- `active`
- `index` when `DynamicScroller` uses simple-array mode or a function `keyField`

Recommended dynamic inputs:

- `emitResize` only when the parent UI needs resize callbacks

## Core props/options

- `item`
- `active`
- `index`
- `watchData`
- `tag`
- `emitResize`

Documented guidance:

- pass slot `index` directly when it is required
- `watchData` is only for legacy no-`ResizeObserver` fallbacks and is not recommended for performance-sensitive lists

## Events/returns

Documented event:

- `resize` when `emitResize` is `true`

## Pitfalls

- Omitting `active` breaks the documented optimization path.
- Reaching for `watchData` first is usually the wrong tradeoff.
- `emitResize` increases work and should stay off unless needed.
- Debug DOM attributes do not define measurement identity.

## Example patterns

Track text-driven height changes:

```vue
<DynamicScrollerItem
  :item="item"
  :active="active"
>
  <p>{{ item.message }}</p>
</DynamicScrollerItem>
```

Custom tag:

```vue
<DynamicScrollerItem
  :item="item"
  :active="active"
  tag="article"
>
  {{ item.title }}
</DynamicScrollerItem>
```

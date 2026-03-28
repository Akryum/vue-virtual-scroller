# DynamicScrollerItem

Scope: the per-item measurement wrapper used inside `DynamicScroller`.

When wrapper-free markup is required, prefer the headless `vDynamicScrollerItem` directive returned by `useDynamicScroller` instead of this component wrapper.

## Provenance

Generated from the package's public dynamic-item documentation and shipped demo patterns at skill generation time.

## When to use

- You are rendering an item inside `DynamicScroller`.
- The rendered content can change size after first render.
- You need resize events for item-level measurement updates.

## Required inputs

- `item`
- `active`

Recommended for real updates:

- `sizeDependencies`

## Core props/options

- `item`
- `active`
- `sizeDependencies`
- `watchData`
- `tag`
- `emitResize`

Documented guidance:

- Prefer `sizeDependencies` over `watchData`.
- `watchData` deeply watches the item and is not recommended for performance-sensitive lists.

## Events/returns

Documented event:

- `resize` when `emitResize` is `true`

## Pitfalls

- Omitting `active` breaks the documented optimization path for avoiding unnecessary recomputation.
- Reaching for `watchData` first is usually the wrong tradeoff; use targeted dependencies instead.
- `emitResize` increases work and should be enabled only when the parent UI needs to react.

## Example patterns

Track text-driven height changes:

```vue
<DynamicScrollerItem
  :item="item"
  :active="active"
  :size-dependencies="[item.message]"
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

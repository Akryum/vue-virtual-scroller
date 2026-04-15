# WindowScroller

Scope: the component path for virtual lists driven by browser window scrolling.

## Provenance

Generated from the package's public window-scrolling documentation at skill generation time.

## When to use

- The browser window should own scrolling.
- The list should stay in normal page flow with content above or below it.
- You want a documented public API instead of relying on `pageMode`.

## Required inputs

- `items`
- `itemSize` as a fixed number, `null` plus `sizeField`, or a resolver function
- `keyField` when object items do not use `id`
- Normal page-flow layout instead of an inner scrolling box

## Core props/options

`WindowScroller` accepts the same core props as `RecycleScroller`, except window scrolling is always on.

Most-used props:

- `items`
- `keyField`
- `direction`
- `itemSize`
- `gridItems`
- `itemSecondarySize`
- `sizeField`
- `buffer`
- `shift`
- `cache`
- `disableTransform`

Documented behavior:

- `itemSize` can be a fixed number, `null`, or `(item, index) => number`
- `gridItems` still requires a fixed numeric `itemSize`
- new code should prefer `WindowScroller` over `RecycleScroller pageMode` for page scrolling

## Events/returns

Documented slot props and events match the `RecycleScroller` surface:

- default slot: `item`, `index`, `active`
- named slots: `before`, `after`, `empty`
- events: `resize`, `visible`, `hidden`, `update(...)`
- exposed helpers: `scrollToItem`, `scrollToPosition`, `getScroll`, `findItemIndex`, `getItemOffset`, `getItemSize`, `cacheSnapshot`, `restoreCache`, `updateVisibleItems`

## Pitfalls

- Do not give the list its own fixed scrolling container when the page should own scrolling.
- Use `DynamicScroller` instead when item size must be measured from the DOM.
- The same recycled-view caveats still apply: children must react when `item` changes.

## Example patterns

Basic page-scrolling list:

```vue
<WindowScroller
  v-slot="{ item }"
  :items="rows"
  :item-size="40"
  key-field="id"
>
  <div class="row">
    {{ item.label }}
  </div>
</WindowScroller>
```

Variable-size page-scrolling list:

```vue
<WindowScroller
  :items="rows"
  :item-size="null"
  size-field="size"
  key-field="id"
>
  <template #default="{ item }">
    {{ item.label }}
  </template>
</WindowScroller>
```

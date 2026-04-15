# DynamicScroller

Scope: the component path for unknown-size items that must be measured after render.

## Provenance

Generated from the package's public dynamic-sizing documentation and shipped demo patterns at skill generation time.

## When to use

- Item heights or widths are not known before render.
- Content can grow or shrink after filtering, editing, or streaming.
- You want automatic measurement without building the headless path yourself.

## Required inputs

- `items`
- `minItemSize`
- A `DynamicScrollerItem` around each rendered item
- Scroll-container sizing in CSS

## Core props/options

`DynamicScroller` supports the documented `RecycleScroller` props and adds the dynamic measurement path on top.

Important documented guidance:

- `minItemSize` is required
- you do not need a `size` field on each item
- keep `sizeField` on the default path because size management is internal
- `shift`, `cache`, and `disableTransform` still apply here

## Events/returns

`DynamicScroller` exposes the same events and slots as `RecycleScroller`.

Important exposed helpers:

- `scrollToItem`
- `scrollToPosition`
- `findItemIndex`
- `getItemOffset`
- `getItemSize(item, index?)`
- `scrollToBottom`
- `cacheSnapshot`
- `restoreCache`
- `forceUpdate(clear?)`

## Pitfalls

- `DynamicScroller` does not guess which data changes affect layout; pass them to `DynamicScrollerItem` through `sizeDependencies`.
- Pass slot `index` to `DynamicScrollerItem` when using simple-array mode or a function `keyField`.
- Missing `minItemSize` hurts first render and scroll math.
- Prefer `RecycleScroller` when sizes are already known because it is lighter.

## Example patterns

Unknown-height rows:

```vue
<DynamicScroller
  :items="items"
  :min-item-size="54"
>
  <template #default="{ item, index, active }">
    <DynamicScrollerItem
      :item="item"
      :active="active"
      :index="index"
      :size-dependencies="[item.message]"
    >
      {{ item.message }}
    </DynamicScrollerItem>
  </template>
</DynamicScroller>
```

Append-heavy chat feed:

```vue
<DynamicScroller
  ref="scroller"
  :items="rows"
  :min-item-size="48"
>
  <template #default="{ item, active }">
    <DynamicScrollerItem
      :item="item"
      :active="active"
      :size-dependencies="[item.text]"
    >
      {{ item.text }}
    </DynamicScrollerItem>
  </template>
</DynamicScroller>
```

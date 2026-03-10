# DynamicScroller

Scope: the component path for unknown-size items that must be measured as they render.

## Provenance

Generated from the package's public dynamic-sizing documentation and shipped demo patterns at skill generation time.

## When to use

- Item heights or widths are not known before render.
- Message-like content can grow or change after filtering or appending.
- You need automatic size discovery instead of a precomputed size field.

## Required inputs

- `items`
- `minItemSize` for the initial render path
- A `DynamicScrollerItem` around each rendered item
- Scroll-container sizing in CSS

## Core props/options

`DynamicScroller` extends the documented `RecycleScroller` props.

Key documented guidance:

- `minItemSize` is required.
- It is not recommended to change `sizeField`, because size management is handled internally.
- You do not need a `size` field on each item.

Important inherited props often used in practice:

- `direction`
- `buffer`
- `pageMode`
- `prerender`

## Events/returns

`DynamicScroller` extends the documented `RecycleScroller` events, slot props, and other slots.

The default slot still exposes:

- `item`
- `index`
- `active`

## Pitfalls

- `DynamicScroller` does not detect size changes by itself; dynamic inputs must be forwarded to `DynamicScrollerItem` through `sizeDependencies`.
- Missing `minItemSize` degrades the initial layout.
- This path is heavier than fixed-size virtualization, so prefer `RecycleScroller` when item size is already known.

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
      :size-dependencies="[item.message]"
      :data-index="index"
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
  @resize="scroller?.scrollToBottom()"
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

Horizontal dynamic cards:

```vue
<DynamicScroller
  :items="filteredRows"
  :min-item-size="180"
  direction="horizontal"
>
  <template #default="{ item, active }">
    <DynamicScrollerItem
      :item="item"
      :active="active"
      :size-dependencies="[item.message]"
    >
      {{ item.message }}
    </DynamicScrollerItem>
  </template>
</DynamicScroller>
```

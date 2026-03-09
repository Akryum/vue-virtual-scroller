# DynamicScroller

This works just like the [RecycleScroller](./recycle-scroller), but it can render items with unknown sizes!

## Basic usage

```vue
<script>
export default {
  props: {
    items: Array,
  },
}
</script>

<template>
  <DynamicScroller
    :items="items"
    :min-item-size="54"
    class="scroller"
  >
    <template #default="{ item, index, active }">
      <DynamicScrollerItem
        :item="item"
        :active="active"
        :size-dependencies="[
          item.message,
        ]"
        :data-index="index"
      >
        <div class="avatar">
          <img
            :key="item.avatar"
            :src="item.avatar"
            alt="avatar"
            class="image"
          >
        </div>
        <div class="text">
          {{ item.message }}
        </div>
      </DynamicScrollerItem>
    </template>
  </DynamicScroller>
</template>

<style scoped>
.scroller {
  height: 100%;
}
</style>
```

## Important notes

- `minItemSize` is required for the initial render of items.
- `DynamicScroller` won't detect size changes on its own, but you can put values that can affect the item size with `size-dependencies` on [DynamicScrollerItem](./dynamic-scroller-item).
- You don't need to have a `size` field on the items.

## Props

Extends all the [RecycleScroller props](./recycle-scroller#props).

::: tip
It's not recommended to change the `sizeField` prop since all the size management is done internally.
:::

## Events

Extends all the [RecycleScroller events](./recycle-scroller#events).

## Default scoped slot props

Extends all the [RecycleScroller scoped slot props](./recycle-scroller#default-scoped-slot-props).

## Other slots

Extends all the [RecycleScroller other slots](./recycle-scroller#other-slots).

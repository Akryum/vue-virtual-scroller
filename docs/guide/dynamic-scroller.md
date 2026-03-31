# DynamicScroller

`DynamicScroller` is the right choice when item size is not known ahead of time. It measures items as they render and updates the scroll layout automatically.

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

- `minItemSize` is required so the first render has a reasonable starting estimate.
- `DynamicScroller` does not guess which data changes affect layout. Pass those values to [DynamicScrollerItem](./dynamic-scroller-item) so it knows when to measure again.
- You do not need a `size` field on each item.
- `shift` and `cache` are available here as well because `DynamicScroller` extends `RecycleScroller`.

## Props

`DynamicScroller` supports all [RecycleScroller props](./recycle-scroller#props).

::: tip
It's not recommended to change the `sizeField` prop since all the size management is done internally.
:::

The additions that matter most on the dynamic path are:

- `shift`: keep the viewport anchored during prepends
- `cache`: restore previously known measured sizes

## Events

`DynamicScroller` emits all the same events as [RecycleScroller](./recycle-scroller#events).

## Default scoped slot props

The default slot receives the same scoped props as [RecycleScroller](./recycle-scroller#default-scoped-slot-props).

## Other slots

The `before`, `after`, and `empty` slots behave the same way as in [RecycleScroller](./recycle-scroller#other-slots).

## Exposed methods

With a template ref, `DynamicScroller` exposes the same scrolling helpers as `RecycleScroller`:

- `scrollToItem(index, options?)`
- `scrollToPosition(position, options?)`
- `findItemIndex(offset)`
- `getItemOffset(index)`
- `cacheSnapshot`
- `restoreCache(snapshot)`

It also exposes dynamic-specific helpers:

- `getItemSize(item, index?)`
- `scrollToBottom()`
- `forceUpdate(clear?)`

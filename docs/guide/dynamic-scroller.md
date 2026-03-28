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
- `DynamicScroller` won't detect size changes on its own, but you can put values that affect item size on [DynamicScrollerItem](./dynamic-scroller-item) or on the headless `vDynamicScrollerItem` directive returned by `useDynamicScroller`.
- You don't need to have a `size` field on the items.
- If you need headless rendering with unknown-size items, see the dedicated [`useDynamicScroller` guide](./use-dynamic-scroller).

## Headless usage

`useDynamicScroller` also powers the headless dynamic path for semantic markup and wrapper-free measurement.

The complete headless API is documented in [`useDynamicScroller`](./use-dynamic-scroller). The short version is:

- render from `pool`
- bind the pooled `view` directly into `v-dynamic-scroller-item`
- put `totalSize` on the inner wrapper
- let the directive handle recycled-view positioning and visibility styles

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useDynamicScroller } from 'vue-virtual-scroller'

const rows = ref([
  { id: 1, title: 'Alpha', body: 'Unknown-size content' },
  { id: 2, title: 'Beta', body: 'This row can wrap and grow' },
])

const scrollerEl = ref<HTMLElement>()

const {
  pool,
  totalSize,
  handleScroll,
  vDynamicScrollerItem,
} = useDynamicScroller(computed(() => ({
  items: rows.value,
  keyField: 'id',
  direction: 'vertical' as const,
  minItemSize: 48,
  el: scrollerEl.value,
})))
</script>

<template>
  <div
    ref="scrollerEl"
    class="scroller"
    @scroll.passive="handleScroll"
  >
    <div :style="{ minHeight: `${totalSize}px`, position: 'relative' }">
      <article
        v-for="view in pool"
        :key="view.nr.id"
        v-dynamic-scroller-item="{
          view,
          sizeDependencies: [view.item.item.title, view.item.item.body],
        }"
      >
        <h4>{{ view.item.item.title }}</h4>
        <p>{{ view.item.item.body }}</p>
      </article>
    </div>
  </div>
</template>
```

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

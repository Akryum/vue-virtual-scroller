# WindowScroller

`WindowScroller` is the dedicated window-viewport version of `RecycleScroller`.

Use it when the browser window is the real scroll container and the list should live inside normal page flow with content above or below it.

## When to use it

- The page itself scrolls, not an inner fixed-height container.
- You want a documented public API for window scrolling instead of relying on `pageMode`.
- You still want the same pooled rendering, `shift`, cache restore, and imperative scrolling helpers as `RecycleScroller`.

## Basic usage

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { WindowScroller } from 'vue-virtual-scroller'

const rows = ref(
  Array.from({ length: 1000 }, (_, index) => ({
    id: index + 1,
    label: `Row ${index + 1}`,
  })),
)
</script>

<template>
  <section class="page-content-before">
    Content before the list
  </section>

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
</template>
```

## Props and methods

`WindowScroller` uses the same core props, events, slot props, and exposed methods as [`RecycleScroller`](./recycle-scroller), except it always uses the browser window as the scroll transport.

That means it supports:

- `shift`
- `cache`
- `scrollToItem(index, options?)`
- `scrollToPosition(position, options?)`
- `findItemIndex(offset)`
- `getItemOffset(index)`
- `getItemSize(index)`
- `cacheSnapshot`
- `restoreCache(snapshot)`

## Headless usage

Use `useWindowScroller` when you want the same behavior without the bundled component markup:

```ts
import { computed, ref } from 'vue'
import { useWindowScroller } from 'vue-virtual-scroller'

const el = ref<HTMLElement>()
const rows = ref([
  { id: 1, label: 'Alpha' },
  { id: 2, label: 'Beta' },
])

const scroller = useWindowScroller(computed(() => ({
  items: rows.value,
  keyField: 'id',
  direction: 'vertical' as const,
  itemSize: 40,
  minItemSize: null,
  sizeField: 'size',
  typeField: 'type',
  buffer: 200,
  shift: false,
  prerender: 0,
  emitUpdate: false,
  updateInterval: 0,
})), el)
```

## `WindowScroller` vs `pageMode`

- Prefer `WindowScroller` for new code when window scrolling is intentional.
- Keep using `pageMode` on `RecycleScroller` when you only need the older compatibility behavior and do not want to switch components yet.

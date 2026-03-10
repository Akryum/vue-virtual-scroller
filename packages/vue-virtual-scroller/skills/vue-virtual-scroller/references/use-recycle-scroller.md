# useRecycleScroller

Scope: the headless virtualization composable for building custom scroll UIs without the bundled component markup.

## Provenance

Generated from the package's public headless virtualization documentation at skill generation time.

## When to use

- You need a custom DOM structure that does not fit the component slot API.
- You want to integrate virtualization into an existing design-system component.
- You want direct control over pooled views, scroll handling, and item placement.

## Required inputs

- A scroller element ref.
- An options object containing the same core settings used by `RecycleScroller`:
  - `items`
  - `keyField`
  - `direction`
  - `itemSize`
  - `minItemSize`
  - `sizeField`
  - `typeField`
  - `buffer`
  - `pageMode`
  - `prerender`
  - `emitUpdate`
  - `updateInterval`

Optional grid inputs:

- `gridItems`
- `itemSecondarySize`

## Core props/options

Fixed-size path:

- set `itemSize` to a number

Variable-size path:

- set `itemSize` to `null`
- provide a numeric field on each item
- set `sizeField` if that field is not `size`

The composable manages virtualization state, but markup, CSS, and event wiring stay in user land.

## Events/returns

Documented returns used most often:

- `pool`
- `totalSize`
- `handleScroll`
- `scrollToItem(index)`
- `scrollToPosition(px)`
- `getScroll()`
- `updateVisibleItems(itemsChanged, checkPositionDiff?)`

## Pitfalls

- You must provide your own scrollable sizing styles.
- Without a stable key field, object-item reuse becomes unreliable.
- This composable does not provide measurement for unknown-size items; move to `DynamicScroller` when content size must be discovered from the DOM.

## Example patterns

Minimal fixed-size setup:

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRecycleScroller } from 'vue-virtual-scroller'

const items = ref(Array.from({ length: 10000 }, (_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
})))

const scrollerEl = ref<HTMLElement>()

const options = computed(() => ({
  items: items.value,
  keyField: 'id',
  direction: 'vertical' as const,
  itemSize: 40,
  minItemSize: null,
  sizeField: 'size',
  typeField: 'type',
  buffer: 200,
  pageMode: false,
  prerender: 0,
  emitUpdate: false,
  updateInterval: 0,
}))

const { pool, totalSize, handleScroll } = useRecycleScroller(options, scrollerEl)
</script>
```

Variable-size setup with explicit item field:

```ts
const options = computed(() => ({
  items: items.value,
  keyField: 'id',
  direction: 'vertical' as const,
  itemSize: null,
  minItemSize: 40,
  sizeField: 'size',
  typeField: 'type',
  buffer: 200,
  pageMode: false,
  prerender: 0,
  emitUpdate: false,
  updateInterval: 0,
}))
```

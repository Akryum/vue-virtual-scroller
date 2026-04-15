# useRecycleScroller

Scope: the headless virtualization composable for building custom scroll UIs without the bundled component markup.

## Provenance

Generated from the package's public headless virtualization documentation at skill generation time.

## When to use

- You need a custom DOM structure that does not fit the component slot API.
- You want direct control over pooled views and item placement.
- Item size is fixed or already known before render.

## Required inputs

- A scroller element ref
- An options object with the documented core settings:
  - `items`
  - `keyField`
  - `direction` (optional, defaults to `'vertical'`)
  - `itemSize`
  - `minItemSize`
  - `sizeField`
  - `typeField`
  - `buffer`
  - `pageMode`
  - `prerender`
  - `emitUpdate`
  - `updateInterval`

Optional extras:

- `gridItems`
- `itemSecondarySize`
- `shift`
- `cache`
- `disableTransform`

## Core props/options

Documented sizing paths:

- fixed numeric `itemSize`
- `itemSize: null` plus numeric `sizeField`
- `itemSize(item, index)` resolver when size is already known in memory

Documented keying path:

- `keyField` can be a string field name or `(item, index) => string | number`

## Events/returns

Returns used most often:

- `pool`
- `visiblePool`
- `totalSize`
- `scrollToItem`
- `scrollToPosition`
- `getScroll`
- `findItemIndex`
- `getItemOffset`
- `getItemSize`
- `getViewStyle`
- `cacheSnapshot`
- `restoreCache`
- `updateVisibleItems`

## Pitfalls

- You must provide your own scrollable sizing styles.
- Render from `pool` and hide inactive views instead of filtering them out when you want normal recycling behavior.
- Without a stable key field, object-item reuse becomes unreliable.
- If size must be measured from the DOM after render, move to `useDynamicScroller`.
- If the browser window owns scrolling, move to `useWindowScroller`.

## Example patterns

Minimal fixed-size setup:

```vue
<script setup lang="ts">
import { computed, useTemplateRef } from 'vue'
import { useRecycleScroller } from 'vue-virtual-scroller'

const scrollerEl = useTemplateRef<HTMLElement>('scrollerEl')

const { pool, totalSize, getViewStyle } = useRecycleScroller(computed(() => ({
  items: rows.value,
  keyField: 'id',
  itemSize: 40,
  minItemSize: null,
  sizeField: 'size',
  typeField: 'type',
  buffer: 200,
  pageMode: false,
  prerender: 0,
  emitUpdate: false,
  updateInterval: 0,
})), scrollerEl)
</script>
```

Resolver-based size:

```ts
const itemSize = (item: Row, index: number) => item.compact ? 40 : 56
```

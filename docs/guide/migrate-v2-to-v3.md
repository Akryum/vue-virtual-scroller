# Migrate from v2 to v3

Use this guide to migrate from `v2.0.1` to `v3`.

## Component users

If you mainly use `RecycleScroller`, `DynamicScroller`, or `WindowScroller`, migration is usually small and mostly comes down to updated options and guidance.

### `RecycleScroller`

New capabilities and guidance:

- `keyField` can now be either a string field name or a resolver function `(item, index) => string | number`.
- `itemSize` can now be either a fixed number, `null`, or a resolver function `(item, index) => number`.
- `disableTransform` lets pooled views use `top` / `left` positioning instead of transforms.
- `flowMode` keeps active pooled views in normal document flow with spacer elements.
- `startSpacerSize` and `endSpacerSize` are exposed for advanced integrations when `flowMode` is active.
- `flowMode` only supports vertical single-axis layouts. It does not support horizontal virtualization or grids, and `hiddenPosition` does not apply there.

### `DynamicScroller`

`DynamicScroller` now supports the same layout controls as the core scroller:

- `disableTransform`
- `flowMode`
- `hiddenPosition`

Pass `:index="index"` to `DynamicScrollerItem` when you use simple-array mode or a function `keyField`. With object items and a normal string `keyField` such as `'id'`, `index` is still optional.

### `WindowScroller`

`WindowScroller` is now the preferred documented path when the browser window owns scrolling.

- Use `WindowScroller` for new window-scrolling code.
- Keep `pageMode` on `RecycleScroller` only for older compatibility behavior.

## Headless composables

If you use the headless APIs, this is where the important migration work lives.

## `useRecycleScroller`

Main changes:

- `handleScroll` is no longer part of the return value.
- `getViewStyle(view)` is now the preferred way to position pooled views.
- `startSpacerSize` and `endSpacerSize` were added for `flowMode`.
- `keyField` can now be a resolver function.
- `itemSize` can now be a resolver function.

Before:

```vue{7,12,17-20}
<script setup lang="ts">
const scrollerEl = useTemplateRef('scrollerEl')

const {
  pool,
  totalSize,
  handleScroll,
} = useRecycleScroller(options, scrollerEl)
</script>

<template>
  <div ref="scrollerEl" class="scroller" @scroll.passive="handleScroll">
    <div :style="{ minHeight: `${totalSize}px`, position: 'relative' }">
      <article
        v-for="view in pool"
        :key="view.nr.id"
        :style="{
          transform: `translateY(${view.position}px)`,
          visibility: view.nr.used ? 'visible' : 'hidden',
          pointerEvents: view.nr.used ? undefined : 'none',
        }"
      />
    </div>
  </div>
</template>
```

After:

```vue{7,12,17}
<script setup lang="ts">
const scrollerEl = useTemplateRef('scrollerEl')

const {
  pool,
  totalSize,
  getViewStyle,
} = useRecycleScroller(options, scrollerEl)
</script>

<template>
  <div ref="scrollerEl" class="scroller">
    <div :style="{ minHeight: `${totalSize}px`, position: 'relative' }">
      <article
        v-for="view in pool"
        :key="view.nr.id"
        :style="getViewStyle(view)"
      />
    </div>
  </div>
</template>
```

If you adopt `flowMode`, render spacer elements from `startSpacerSize` and `endSpacerSize` instead of relying on one absolutely positioned inner wrapper.

## `useDynamicScroller`

Main changes:

- `handleScroll` is no longer returned.
- Pooled `view` objects were flattened for normal rendering.
- The original item moved from `view.item.item` to `view.item`.
- Advanced size metadata still exists at `view.itemWithSize`.
- `getViewStyle(view)` was added.
- `startSpacerSize` and `endSpacerSize` were added.
- `v-dynamic-scroller-item` examples should use `view.id` where relevant and direct `view.item.*` access.

Before:

```vue{7,13,17-24}
<script setup lang="ts">
const scrollerEl = useTemplateRef('scrollerEl')

const {
  pool,
  totalSize,
  handleScroll,
  vDynamicScrollerItem,
} = useDynamicScroller(options)
</script>

<template>
  <div ref="scrollerEl" class="scroller" @scroll.passive="handleScroll">
    <div :style="{ minHeight: `${totalSize}px`, position: 'relative' }">
      <article
        v-for="view in pool"
        :key="view.nr.id"
        v-dynamic-scroller-item="{ view }"
      >
        <h4>{{ view.item.item.title }}</h4>
        <p>{{ view.item.item.body }}</p>
      </article>
    </div>
  </div>
</template>
```

After:

```vue{7,12,16-23}
<script setup lang="ts">
const scrollerEl = useTemplateRef('scrollerEl')

const {
  pool,
  totalSize,
  vDynamicScrollerItem,
} = useDynamicScroller(options)
</script>

<template>
  <div ref="scrollerEl" class="scroller">
    <div :style="{ minHeight: `${totalSize}px`, position: 'relative' }">
      <article
        v-for="view in pool"
        :key="view.id"
        v-dynamic-scroller-item="{ view }"
      >
        <h4>{{ view.item.title }}</h4>
        <p>{{ view.item.body }}</p>
      </article>
    </div>
  </div>
</template>
```

The old item path was `view.item.item`. In v3, use `view.item`, while advanced size metadata stays at `view.itemWithSize`.

## `useWindowScroller`

`useWindowScroller` follows the same migration pattern as `useRecycleScroller`:

- prefer `getViewStyle(view)` instead of manually rebuilding pooled styles
- do not look for `handleScroll` in returned values
- `keyField` can be a resolver function
- `itemSize` can be a resolver function

Before:

```vue{4-7}
<div
  v-for="view in pool"
  :key="view.nr.id"
  :style="{
    transform: `translateY(${view.position}px)`,
    visibility: view.nr.used ? 'visible' : 'hidden',
    pointerEvents: view.nr.used ? undefined : 'none',
  }"
/>
```

After:

```vue{4}
<div
  v-for="view in pool"
  :key="view.nr.id"
  :style="getViewStyle(view)"
/>
```

## `useTableColumnWidths`

`useTableColumnWidths` is a new helper for semantic tables. Use it when you render a real `<table>` and pooled rows make native column widths drift. It is not needed for ordinary list migrations.

## Migration checklist

If you use components only:

- verify `DynamicScrollerItem` receives `:index="index"` when you use simple arrays or a function `keyField`
- move window-owned scrolling to [`WindowScroller`](./window-scroller) when you want the newer documented path
- adopt `disableTransform` or `flowMode` only if you need those layout controls

If you use composables:

- remove old `handleScroll` usage
- replace manual pooled positioning with `getViewStyle(view)`
- update `useDynamicScroller` templates from `view.item.item` to `view.item`
- add spacer rendering if you adopt `flowMode`
- use [`useTableColumnWidths`](./use-table-column-widths) only for semantic table layouts

See [`useRecycleScroller`](./use-recycle-scroller), [`useDynamicScroller`](./use-dynamic-scroller), and [`useWindowScroller`](./use-window-scroller) for the full v3 APIs.

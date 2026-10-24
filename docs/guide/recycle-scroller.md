# RecycleScroller

`RecycleScroller` is the core component for virtualizing large lists in Vue. It renders only the visible items, then reuses component instances and DOM nodes as you scroll.

## Basic usage

Use the default scoped slot to render each item in the list:

```vue
<script>
export default {
  props: {
    list: Array,
  },
}
</script>

<template>
  <RecycleScroller
    v-slot="{ item }"
    class="scroller"
    :items="list"
    :item-size="32"
    key-field="id"
  >
    <div class="user">
      {{ item.name }}
    </div>
  </RecycleScroller>
</template>

<style scoped>
.scroller {
  height: 100%;
}

.user {
  height: 32%;
  padding: 0 12px;
  display: flex;
  align-items: center;
}
</style>
```

## TypeScript generics

With Vue 3.3+, `RecycleScroller` infers the item type from `items`, so the default slot stays item-aware in TypeScript:

```vue
<script setup lang="ts">
import { ref } from 'vue'

interface Message {
  id: string
  text: string
  size: number
}

const messages = ref<Message[]>([])
</script>

<template>
  <RecycleScroller :items="messages" :item-size="32">
    <template #default="{ item }">
      {{ item.text.toUpperCase() }}
    </template>
  </RecycleScroller>
</template>
```

If you want compile-time validation for string `keyField` values or `sizeField`, use the headless [`useRecycleScroller`](./use-recycle-scroller) API with an explicit generic parameter.

## Important notes

::: warning
Set the size of the scroller element and the item elements yourself, usually with CSS. Unless you are using [variable size mode](#variable-size-mode), every item should have the same height, or width in horizontal mode.
:::

::: warning
If your items are objects, the scroller needs a stable identifier for each one. By default it looks for an `id` field. Use `keyField` if your data uses a different property name, or pass a resolver function with the signature `(item, index) => string | number` for derived keys such as composite IDs.

```vue
<RecycleScroller
  :items="messages"
  :item-size="32"
  :key-field="(item, index) => `${item.threadId}:${item.id}:${index}`"
>
```
:::

- Avoid functional components inside `RecycleScroller`. Because views are reused, they are usually slower here rather than faster.
- Item components must react correctly when the `item` prop changes without the component being recreated. Computed properties and watchers are usually the right tools for that.
- You do not need to set `key` on the list content itself, but nested `<img>` elements should still use keys to avoid loading glitches.
- Do not key nested components by item identity (for example `:key="item.id"` on a tooltip or popover inside the row). Every reuse then unmounts and remounts that subtree, re-running its setup and `onMounted` work, such as data fetches, on every scrolled row. Watch the item instead.
- Browsers impose size limits on very large DOM elements, so the practical ceiling is still around a few hundred thousand items depending on the browser.
- Because DOM elements are reused, hover styles should usually rely on the provided `hover` class rather than the `:hover` selector.

## Mixed item kinds

When the list renders different components depending on the item (for example `v-if="item.kind === 'header'"` / `v-else`), tell the scroller which field holds that kind with `typeField`. It keeps one recycled pool per distinct value, so a view that showed a header is only reused for another header.

```vue
<RecycleScroller
  :items="rows"
  :item-size="32"
  type-field="kind"
>
  <template #default="{ item }">
    <GroupHeader v-if="item.kind === 'group'" :group="item" />
    <FileRow v-else :file="item" />
  </template>
</RecycleScroller>
```

Without it, every item falls into the same pool (the default `'type'` field is usually missing, so all items share the `undefined` type). Whenever a view is reused for an item of another kind, the `v-if` branch flips and Vue unmounts the old component tree and mounts a new one, which defeats recycling and makes scrolling expensive for rich rows.

## Keep scroller inputs stable

Each time `RecycleScroller` receives new props, it re-reads its options. Avoid creating new values for it on every parent render, especially in components that re-render while scrolling:

- Define an `itemSize` resolver once in `<script setup>` instead of inline in the template. A recreated resolver is re-run over every item, even when the sizes it returns did not change.
- Do not read parent state that changes on every scroll inside the default slot. The slot is rendered by every visible view, so such state re-renders all of them on each scroll event.
- Track per-row state read in the slot, such as hovered, active or selected rows, per item. Rebuilding a whole `Set` or array on each change makes every visible row depend on it, and hover changes on every scrolled row as content moves under the pointer. A `reactive(new Set())` mutated in place tracks `has(id)` per key, so only rows whose state changed re-render.

```vue
<script setup lang="ts">
const metrics = ref({ header: 40, row: 24 })

// Stable identity; still reactive because it reads `metrics.value` when called.
function rowSize(row: Row) {
  return row.kind === 'group' ? metrics.value.header : metrics.value.row
}
</script>

<template>
  <RecycleScroller :items="rows" :item-size="rowSize" type-field="kind">
    <!-- ... -->
  </RecycleScroller>
</template>
```

## Avoid scroll-time work around the scroller

`RecycleScroller` reads its scroll geometry during the native scroll event, while layout is still clean, and updates views in the next animation frame. Code around it should follow the same rule:

- Read `scrollTop`, `clientHeight` or `getBoundingClientRect()` inside a scroll event handler, not in a watcher, `nextTick`, `requestAnimationFrame` callback or `update` handler. Those run after Vue has patched the DOM, so each read forces a synchronous style and layout pass on every scrolled frame.
- Watch for global listeners that measure on any scroll. For example, VueUse `useElementBounding` defaults to `windowScroll: true`, which listens to scroll events in capture mode: every scroll inside a virtual list re-measures its target. Pass `{ windowScroll: false }` when the element does not move with scrolling.
- If you render pinned or sticky copies of rows outside the scroller, such as section headers, key them by their slot (for example `'top'` or `'second'`) rather than by item id. A change then patches the existing row instead of unmounting one row tree and mounting another.

## How it works

- `RecycleScroller` creates pools of reusable views for the visible part of the list.
- Each view holds one rendered item and can later be reassigned to another item.
- If you render multiple item types, each type gets its own pool so Vue can reuse compatible component trees.
- Views that move off-screen are deactivated and reused when new items enter the viewport.

In vertical mode, the internal structure looks like this:

```html
<RecycleScroller>
  <!-- Wrapper element with a pre-calculated total height -->
  <wrapper
    :style="{ height: computedTotalHeight + 'px' }"
  >
    <!-- Each view is translated to the computed position -->
    <view
      v-for="view of pool"
      :style="{ transform: 'translateY(' + view.computedTop + 'px)' }"
    >
      <!-- Your elements will be rendered here -->
      <slot
        :item="view.item"
        :index="view.nr.index"
        :active="view.nr.used"
      />
    </view>
  </wrapper>
</RecycleScroller>
```

As you scroll, most views are simply moved to new positions and receive updated slot props. That keeps component creation and DOM churn low, which is where most of the performance gains come from.

## Props

| Prop | Default | Description |
|------|---------|-------------|
| `items` | — | List of items you want to display in the scroller. |
| `direction` | `'vertical'` | Scrolling direction, either `'vertical'` or `'horizontal'`. |
| `itemSize` | `null` | Display height (or width in horizontal mode) of the items in pixels used to calculate the scroll size and position. Accepts a fixed number, `null` for `sizeField`-based [variable size mode](#variable-size-mode), or a resolver function `(item, index) => number`. |
| `gridItems` | — | Display that many items on the same line to create a grid. You must set `itemSize` to a fixed number to use this prop (dynamic sizes are not supported). |
| `itemSecondarySize` | — | Size in pixels (width in vertical mode, height in horizontal mode) of the items in the grid when `gridItems` is set. Defaults to `itemSize` if not set. |
| `minItemSize` | — | Minimum size used if the height (or width in horizontal mode) of an item is unknown. |
| `sizeField` | `'size'` | Field used to get the item's size in variable size mode. |
| `typeField` | `'type'` | Field used to differentiate different kinds of components in the list. For each distinct type, a pool of recycled items will be created. See [Mixed item kinds](#mixed-item-kinds). |
| `keyField` | `'id'` | Field name or resolver function `(item, index) => string \| number` used to identify items and optimize managing rendered views. |
| `shift` | `false` | Keep the viewport anchored when items are prepended at the start of the list. Useful for chat-style feeds and reverse timelines. |
| `cache` | — | Optional cache snapshot returned by `cacheSnapshot` to restore known item sizes after remounting. |
| `prerender` | `0` | Render a fixed number of items for Server-Side Rendering (SSR). |
| `buffer` | `200` | Amount of pixels to add to edges of the scrolling visible area to start rendering items further away. |
| `emitUpdate` | `false` | Emit an `'update'` event each time the virtual scroller content is updated (can impact performance). |
| `disableTransform` | `false` | Use absolute `top`/`left` positioning instead of CSS transforms for pooled item wrappers. This also keeps fixed-grid cross-axis placement in `left`/`top`. |
| `flowMode` | `false` | Keep active pooled views in native document flow and use spacer elements before/after them instead of absolute positioning. v1 only supports vertical single-axis lists. `gridItems`, horizontal mode, and `hiddenPosition` fall back to standard positioning. |
| `updateInterval` | `0` | The interval in ms at which the view will be checked for updates after scrolling. When set to `0`, check happens during the next animation frame. |
| `itemsLimit` | `1000` | Maximum number of rendered views allowed before reporting a missing scroll boundary. A positive value overrides the global limit for this scroller. Sparse two-axis grids count rendered views, not the flattened index span between them. |
| `enabled` | `true` | When `false`, the scroller mounts in a passive state: no watchers, observers, scroll/resize listeners, RAFs, or timers are attached, and `pool`, `totalSize`, and the spacer sizes stay at their inert defaults. Useful when a wrapper component conditionally renders virtualized output but wants to keep the scroller invocation stable. Toggling back to `true` re-arms the scroller without remounting. |
| `pageMode` | `false` | Use an outer scroll container — the closest `overflow:auto/scroll` ancestor, or `window` — to drive virtualization instead of letting the scroller own its own scroll box. See [Page mode](#page-mode). |
| `scrollParent` | `undefined` | Override the scroll-parent auto-detection used when `pageMode` is enabled. Accepts an `HTMLElement` (typically a ref to an `overflow:auto` ancestor) or `Window`. When omitted, the scroller walks the DOM for the nearest scrollable ancestor. See [issue #928](https://github.com/Akryum/vue-virtual-scroller/issues/928). |
| `listClass` | `''` | Custom classes added to the item list wrapper. |
| `itemClass` | `''` | Custom classes added to each item. |
| `listTag` | `'div'` | The element to render as the list's wrapper. |
| `itemTag` | `'div'` | The element to render as the list item (the direct parent of the default slot content). |

## Events

| Event | Description |
|-------|-------------|
| `resize` | Emitted when the size of the scroller changes. |
| `visible` | Emitted when the scroller considers itself to be visible in the page. |
| `hidden` | Emitted when the scroller is hidden in the page. |
| `update(startIndex, endIndex, visibleStartIndex, visibleEndIndex)` | Emitted each time the views are updated, only if `emitUpdate` prop is `true`. |
| `scroll-start` | Emitted when the first item is rendered. |
| `scroll-end` | Emitted when the last item is rendered. |

## Default scoped slot props

| Prop | Description |
|------|-------------|
| `item` | Item being rendered in a view. |
| `index` | Reflects each item's position in the `items` array. |
| `active` | Whether or not the view is active. An active view is considered visible and being positioned by RecycleScroller. An inactive view is not considered visible and is hidden from the user. Any rendering-related computations should be skipped if the view is inactive. |

## Other slots

The `empty` slot is rendered only when `items` is empty.

```html
<main>
  <slot name="before"></slot>
  <wrapper>
    <!-- Reused view pools here -->
    <slot name="empty"></slot>
  </wrapper>
  <slot name="after"></slot>
</main>
```

Example:

```vue
<RecycleScroller
  class="scroller"
  :items="list"
  :item-size="32"
>
  <template #before>
    Hey! I'm a message displayed before the items!
  </template>

  <template v-slot="{ item }">
    <div class="user">
      {{ item.name }}
    </div>
  </template>
</RecycleScroller>
```

## Exposed methods

If you keep a template ref to `RecycleScroller` via `useTemplateRef`, the component exposes these helpers:

- `scrollToItem(index, options?)`
- `scrollToPosition(position, options?)`
- `findItemIndex(offset)`
- `getItemOffset(index)`
- `getItemSize(index)`
- `startSpacerSize`
- `endSpacerSize`
- `cacheSnapshot`
- `restoreCache(snapshot)`
- `updateVisibleItems(itemsChanged, checkPositionDiff?)`

## Flow mode

Use `flowMode` when the surrounding CSS must stay close to native layout, such as block rows or semantic lists. In this mode RecycleScroller keeps active pooled views in DOM order and inserts spacer elements ahead of and after the active window.

`flowMode` is intentionally limited in v1:

- vertical direction only
- no `gridItems`
- no horizontal virtualization
- `hiddenPosition` is ignored because parked pooled views use `display: none`

The optional `options` object for scrolling accepts:

- `align`: `'start' | 'center' | 'end' | 'nearest'`
- `smooth`: use native smooth scrolling when available
- `offset`: add or subtract a fixed pixel offset from the computed target

`align: 'nearest'` only scrolls when the target item is outside the current viewport.

## Page mode

Set `:page-mode="true"` when the scroller should virtualize against an *outer* scrollable container instead of giving the list its own scroll box. Two cases are supported:

- **Window scrolling** — the page itself owns the scrollbar. For new code, prefer [`WindowScroller`](./window-scroller), which is a dedicated wrapper with a stable public API.
- **A scrollable `<div>` ancestor** — `RecycleScroller` walks the DOM and picks the nearest `overflow:auto/scroll` parent. Useful when an existing pane already provides scrolling (sidebars, modal bodies, dashboard cards).

```vue
<div style="height: 300px; overflow: auto">
  <RecycleScroller
    :items="list"
    :item-size="32"
    :page-mode="true"
  >
    <template #default="{ item }">
      <div class="row">{{ item.name }}
</div>
    </template>
  </RecycleScroller>
</div>
```

If your layout has multiple scroll boundaries or you want to skip the DOM walk, pass the parent explicitly through `scrollParent`:

```vue
<script setup>
import { ref } from 'vue'

const parentEl = ref(null)
const list = ref(/* ... */)
</script>

<template>
  <div ref="parentEl" style="height: 300px; overflow: auto">
    <RecycleScroller
      :items="list"
      :item-size="32"
      :page-mode="true"
      :scroll-parent="parentEl"
    />
  </div>
</template>
```

See the [Page-mode + div scroll-parent demo](../demos/page-mode-div-parent) for a live example covering [issue #928](https://github.com/Akryum/vue-virtual-scroller/issues/928).

## Prepend anchoring and cache restore

Use `shift` when items are inserted at the beginning of the list and you want the current content to stay visually anchored.

Use `cacheSnapshot` together with the `cache` prop or `restoreCache(snapshot)` when the same list is remounted and you want to reuse previously known item sizes instead of measuring them again.

See the dedicated [Shift demo](../demos/shift) for a prepend-history example.

## Variable size mode

::: warning
This mode can be performance heavy with a lot of items. Use with caution.
:::

If `itemSize` is omitted or set to `null`, the scroller switches to variable size mode. In that case, each item must expose a numeric field with its size.

You can also pass `itemSize` as a resolver function with the signature `(item, index) => number` when the size is already available in memory but not stored under a single field name. Define it once rather than inline in the template, see [Keep scroller inputs stable](#keep-scroller-inputs-stable).

::: warning
You still need to set the size of the items with CSS correctly (with classes for example).
:::

Use the `sizeField` prop, which defaults to `'size'`, to choose the field that stores that value when `itemSize` is `null`.

`gridItems` still requires a fixed numeric `itemSize`. Function-based item sizes are not supported in grid mode.

See the dedicated [Function `itemSize` demo](../demos/function-item-size) for a live example that derives row heights from item content and UI state.

Example:

```js
const items = [
  {
    id: 1,
    label: 'Title',
    size: 64,
  },
  {
    id: 2,
    label: 'Foo',
    size: 32,
  },
  {
    id: 3,
    label: 'Bar',
    size: 32,
  },
]
```

## Buffer

Use the `buffer` prop, in pixels, to render a little beyond the visible viewport. For example, a buffer of 1000 means the scroller starts rendering items 1000 pixels below the current viewport and keeps items 1000 pixels above it mounted as well.

The default value is `200`.

```html
<RecycleScroller :buffer="200" />
```

## Conditional virtualization with `enabled`

Set `:enabled="false"` when the scroller call site is stable but you only want
virtualization to run in some scenarios — for example, a generic data-table
component that opts into virtualization through a parent prop.

```vue
<RecycleScroller
  :items="rows"
  :item-size="40"
  :enabled="virtualize"
>
  <template #default="{ item }">…</template>
</RecycleScroller>
```

While disabled, the scroller attaches no scroll or resize listeners, runs no
watchers, and exposes an empty pool. Flipping `enabled` to `true` later
re-arms it (no remount needed). This is how host components can keep the
composable mounted unconditionally without paying for it when the user has
not opted in. See [`useRecycleScroller` for the headless equivalent](./use-recycle-scroller#disabling-the-scroller-with-enabled).

## Server-Side Rendering

The `prerender` prop can be set as the number of items to render on the server inside the virtual scroller:

```html
<RecycleScroller
  :items="items"
  :item-size="42"
  :prerender="10"
>
```

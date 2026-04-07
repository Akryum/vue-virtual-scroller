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

If you want compile-time validation for `keyField` or `sizeField`, use the headless [`useRecycleScroller`](./use-recycle-scroller) API with an explicit generic parameter.

## Important notes

::: warning
Set the size of the scroller element and the item elements yourself, usually with CSS. Unless you are using [variable size mode](#variable-size-mode), every item should have the same height, or width in horizontal mode.
:::

::: warning
If your items are objects, the scroller needs a stable identifier for each one. By default it looks for an `id` field. Use `keyField` if your data uses a different property name.
:::

- Avoid functional components inside `RecycleScroller`. Because views are reused, they are usually slower here rather than faster.
- Item components must react correctly when the `item` prop changes without the component being recreated. Computed properties and watchers are usually the right tools for that.
- You do not need to set `key` on the list content itself, but nested `<img>` elements should still use keys to avoid loading glitches.
- Browsers impose size limits on very large DOM elements, so the practical ceiling is still around a few hundred thousand items depending on the browser.
- Because DOM elements are reused, hover styles should usually rely on the provided `hover` class rather than the `:hover` selector.

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
| `itemSize` | `null` | Display height (or width in horizontal mode) of the items in pixels used to calculate the scroll size and position. If set to `null`, it will use [variable size mode](#variable-size-mode). |
| `gridItems` | — | Display that many items on the same line to create a grid. You must set `itemSize` to use this prop (dynamic sizes are not supported). |
| `itemSecondarySize` | — | Size in pixels (width in vertical mode, height in horizontal mode) of the items in the grid when `gridItems` is set. Defaults to `itemSize` if not set. |
| `minItemSize` | — | Minimum size used if the height (or width in horizontal mode) of an item is unknown. |
| `sizeField` | `'size'` | Field used to get the item's size in variable size mode. |
| `typeField` | `'type'` | Field used to differentiate different kinds of components in the list. For each distinct type, a pool of recycled items will be created. |
| `keyField` | `'id'` | Field used to identify items and optimize managing rendered views. |
| `shift` | `false` | Keep the viewport anchored when items are prepended at the start of the list. Useful for chat-style feeds and reverse timelines. |
| `cache` | — | Optional cache snapshot returned by `cacheSnapshot` to restore known item sizes after remounting. |
| `prerender` | `0` | Render a fixed number of items for Server-Side Rendering (SSR). |
| `buffer` | `200` | Amount of pixels to add to edges of the scrolling visible area to start rendering items further away. |
| `emitUpdate` | `false` | Emit an `'update'` event each time the virtual scroller content is updated (can impact performance). |
| `updateInterval` | `0` | The interval in ms at which the view will be checked for updates after scrolling. When set to `0`, check happens during the next animation frame. |
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
- `cacheSnapshot`
- `restoreCache(snapshot)`
- `updateVisibleItems(itemsChanged, checkPositionDiff?)`

The optional `options` object for scrolling accepts:

- `align`: `'start' | 'center' | 'end' | 'nearest'`
- `smooth`: use native smooth scrolling when available
- `offset`: add or subtract a fixed pixel offset from the computed target

`align: 'nearest'` only scrolls when the target item is outside the current viewport.

## Page mode

If the list should always follow window scrolling, prefer [`WindowScroller`](./window-scroller).

## Prepend anchoring and cache restore

Use `shift` when items are inserted at the beginning of the list and you want the current content to stay visually anchored.

Use `cacheSnapshot` together with the `cache` prop or `restoreCache(snapshot)` when the same list is remounted and you want to reuse previously known item sizes instead of measuring them again.

See the dedicated [Shift demo](../demos/shift) for a prepend-history example.

## Variable size mode

::: warning
This mode can be performance heavy with a lot of items. Use with caution.
:::

If `itemSize` is omitted or set to `null`, the scroller switches to variable size mode. In that case, each item must expose a numeric field with its size.

::: warning
You still need to set the size of the items with CSS correctly (with classes for example).
:::

Use the `sizeField` prop, which defaults to `'size'`, to choose the field that stores that value.

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

## Server-Side Rendering

The `prerender` prop can be set as the number of items to render on the server inside the virtual scroller:

```html
<RecycleScroller
  :items="items"
  :item-size="42"
  :prerender="10"
>
```

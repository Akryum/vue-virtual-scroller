# RecycleScroller

RecycleScroller is a virtual scroller that only renders the visible items. As the user scrolls, RecycleScroller reuses all components and DOM nodes to maintain optimal performance.

## Basic usage

Use the scoped slot to render each item in the list:

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

## Important notes

::: warning
You need to set the size of the virtual-scroller element and the items elements (for example, with CSS). Unless you are using [variable size mode](#variable-size-mode), all items should have the same height (or width in horizontal mode) to prevent display glitches.
:::

::: warning
If the items are objects, the scroller needs to be able to identify them. By default it will look for an `id` field on the items. This can be configured with the `keyField` prop if you are using another field name.
:::

- It is not recommended to use functional components inside RecycleScroller since the components are reused (so it will actually be slower).
- The list item components must be reactive to the `item` prop being updated without being re-created (use computed props or watchers to properly react to props changes!).
- You don't need to set `key` on list content (but you should on all nested `<img>` elements to prevent load glitches).
- The browsers have a size limitation on DOM elements, it means that currently the virtual scroller can't display more than ~500k items depending on the browser.
- Since DOM elements are reused for items, it's recommended to define hover styles using the provided `hover` class instead of the `:hover` state selector (e.g. `.vue-recycle-scroller__item-view.hover` or `.hover .some-element-inside-the-item-view`).

## How does it work?

- The RecycleScroller creates pools of views to render visible items to the user.
- A view holds a rendered item, and is reused inside its pool.
- For each type of item, a new pool is created so that the same components (and DOM trees) are reused for the same type.
- Views can be deactivated if they go off-screen, and can be reused anytime for a newly visible item.

Here is what the internals of RecycleScroller look like in vertical mode:

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

When the user scrolls inside RecycleScroller, the views are mostly just moved around to fill the new visible space, and the default slot properties updated. That way we get the minimum amount of components/elements creation and destruction and we use the full power of Vue virtual-dom diff algorithm to optimize DOM operations!

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
| `pageMode` | `false` | Enable [Page mode](#page-mode). |
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

## Page mode

The page mode expands the virtual-scroller and uses the page viewport to compute which items are visible. That way, you can use it in a big page with HTML elements before or after (like a header and a footer). Set the `page-mode` prop to `true`:

```html
<header>
  <menu></menu>
</header>

<RecycleScroller page-mode>
  <!-- ... -->
</RecycleScroller>

<footer>
  Copyright 2017 - Cat
</footer>
```

## Variable size mode

::: warning
This mode can be performance heavy with a lot of items. Use with caution.
:::

If the `itemSize` prop is not set or is set to `null`, the virtual scroller will switch to variable size mode. You then need to expose a number field on the item objects with the size of the item element.

::: warning
You still need to set the size of the items with CSS correctly (with classes for example).
:::

Use the `sizeField` prop (default is `'size'`) to set the field used by the scroller to get the size for each item.

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

You can set the `buffer` prop (in pixels) on the virtual-scroller to extend the viewport considered when determining the visible items. For example, if you set a buffer of 1000 pixels, the virtual-scroller will start rendering items that are 1000 pixels below the bottom of the scroller visible area, and will keep the items that are 1000 pixels above the top of the visible area.

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

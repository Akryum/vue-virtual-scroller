# vue-virtual-scroller

[![npm](https://img.shields.io/npm/v/vue-virtual-scroller.svg) ![npm](https://img.shields.io/npm/dm/vue-virtual-scroller.svg)](https://www.npmjs.com/package/vue-virtual-scroller)
[![vue2](https://img.shields.io/badge/vue-2.x-brightgreen.svg)](https://vuejs.org/)

Smooth scroll with any amount of data ([demo](https://akryum.github.io/vue-virtual-scroller/)).

## Table of contents

- [Installation](#installation)
- [Usage](#usage)
- [Example](#example)

# Installation

```
npm install --save vue-virtual-scroller
```

**⚠️ `vue-virtual-scroller` now uses [vue-observe-visibility](https://github.com/Akryum/vue-observe-visibility#installation) to automatically refresh itself when shown to prevent display glitches. This means you need to include the polyfills needed by `vue-observe-visibility` for this to work.**

## Default import

Install all the components:

```javascript
import Vue from 'vue'
import VueVirtualScroller from 'vue-virtual-scroller'

Vue.use(VueVirtualScroller)
```

Use specific components:

```javascript
import Vue from 'vue'
import { VirtualScroller } from 'vue-virtual-scroller'

Vue.component('virtual-scroller', VirtualScroller)
```

**⚠️ A css file is included when importing the package:**

```js
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
```

## Browser

```html
<link rel="stylesheet" href="vue-virtual-scroller/dist/vue-virtual-scroller.css"/>

<script src="vue.js"></script>
<script src="vue-virtual-scroller/dist/vue-virtual-scroller.min.js"></script>
```

If Vue is detected, the plugin will be installed automatically. If not, install the component:

```javascript
Vue.use(VueVirtualScroller)
```

Or register it with a custom name:

```javascript
Vue.component('virtual-scroller', VueVirtualScroller.VirtualScroller)
```

# Usage

The virtual scroller has three main props:

- `items` is the list of items you want to display in the scroller. There can be several types of item.
- `itemHeight` is the display height of the items in pixels used to calculate the scroll height and position. If it set to `null` (default value), it will use [variable height mode](#variable-height-mode).
- `renderers` is a map of component definitions objects or names for each item type ([more details](#renderers)). If you don't define `renderers`, the scroller will use *scoped slots* ([see below](#scoped-slots)).

⚠️ You need to set the size of the virtual-scroller element and the items elements (for example, with CSS). Unless you are using [variable height mode](#variable-height-mode), all items should have the same height to prevent display glitches.

**It is strongly recommended to use functional components inside virtual-scroller since those are cheap to create and dispose.**

> The browsers have a height limitation on DOM elements, it means that currently the virtual scroller can't display more than ~500k items depending on the browser.

## Renderers

The optional `renderers` prop is an object containing a component definition for each possible value of the item type. If you don't set this prop, [scoped slots](#scoped-slots) will be used instead. **The component definition must have an `item` prop, that will get the item object to render in the scroller.** It will also receive an `index` prop.

There are additional props you can use:

- `typeField` to customize which field is used on the items to get their type and use the corresponding definition in the `renderers` map. The default is `'type'`.
- `keyField` to customize which field is used on the items to set their `key` special attribute (see [the documation](https://vuejs.org/v2/api/#key)). The default is `'id'`.

**For better performance, you should use the `keyField` prop that will set the `key` attribute. Warning! You shouldn't expect items to have the key set at all times, since the scroller may disable them depending on the situation.**

## Scoped slots

Alternatively, you can use [scoped slots](https://vuejs.org/v2/guide/components.html#Scoped-Slots) instead of `renderers`. This is active when you don't define the `renderers` prop on the virtual scroller.

The scope will contain the row's item in the `item` attribute, so you can write `scope="props"` and then use `props.item`. It will also have an `index` attribute.

Here is an example:

```html
<virtual-scroller class="scroller" :items="items" item-height="42" content-tag="table">
  <template slot-scope="props">
    <tr v-if="props.item.type === 'letter'" class="letter" :key="props.itemKey">
      <td>
        {{props.item.value}} Scoped
      </td>
    </tr>

    <tr v-if="props.item.type === 'person'" class="person" :key="props.itemKey">
      <td>
        {{props.item.value.name}}
      </td>
    </tr>
  </template>
</virtual-scroller>
```

**For better performance, you should set the `key` attribute on direct children using the `itemKey` field from the scoped slot and set the `keyField` prop on the virtual scroller.**

## Page mode

The page mode expand the virtual-scroller and use the page viewport to compute which items are visible. That way, you can use it in a big page with HTML elements before or after (like a header and a footer). Just set the `page-mode` props to `true`:

```html
<header>
  <menu></menu>
</header>

<virtual-scroller page-mode></virtual-scroller>

<footer>
  Copyright 2017 - Cat
</footer>
```

## Variable height mode

**⚠️ This mode can be performance heavy with a lot of items. Use with caution.**

If the `itemHeight` prop is not set or set to `null`, the virtual scroller will switch to Variable height mode. You then need to expose a number field on the item objects with the height of the item element.

**⚠️ You still need to set the height of the items with CSS correctly (with classes for example).**

Use the `heightField` prop (default is `'height'`) to set the field used by the scroller to get the height for each item.

Example:

```javascript
const items = [
  {
    id: 1,
    label: 'Title',
    height: 64,
  },
  {
    id: 2,
    label: 'Foo',
    height: 32,
  },
  {
    id: 3,
    label: 'Bar',
    height: 32,
  },
]
```

## Buffer

You can set the `buffer` prop (in pixels) on the virtual-scroller to extend the viewport considered when determining the visible items. For example, if you set a buffer of 1000 pixels, the virtual-scroller will start rendering items that are 1000 pixels below the bottom of the scroller visible area, and will keep the items that are 1000 pixels above the top of the visible area.

The default value is `200`.

```html
<virtual-scroller buffer="200" />
```

## Pool Size

The `poolSize` prop (in pixels) is the size in pixels of the viewport pool. The computed 'visible' area can be computed step by step using this pool. This allows creating multiple row at once each in a while. For example, if you set a pool size of 2000 pixels, the rows will be grouped in pools of 2000 pixels height. When the user scrolls too far, the new batch of 2000px height is created, and so on. That way, the DOM isn't updated for each row, but in batches instead.

The default value is `2000`.

```html
<virtual-scroller pool-size="2000" />
```

## Update event

Set the `emitUpdate` boolean prop to `true` so that the virtual-scroller will emit an `update` event when the rendered items list is updated. The arguments are `startIndex` and `endIndex`.

The default value is `false`.

```html
<virtual-scroller emit-update @update="(startIndex, endIndex) => ..." />
```

## Customizing the tags

These are optional props you can use to change the DOM tags used in the virtual scroller:

- `mainTag` to change the DOM tag of the component root element. The default is `'div'`.
- `containerTag` to change the DOM tag of the element simulating the height. The default is `'div'`.
- `contentTag` to change the DOM tag of the element containing the items. The default is `'div'`. For example, you can change this to `'table'`.

The component template is structured like this:

```html
<main>
  <container>
    <content>
      <!-- Your items here -->
    </content>
  </container>
</main>
```

If you set `contentTag` to `'table'`, the actual result in the DOM will look like the following:

```html
<div>
  <div>
    <table>
      <!-- Your items here -->
    </table>
  </div>
</div>
```

## Customizing the classes

You can use the following props to customize the container and content elements CSS classes:

- `containerClass`
- `contentClass`


## Slots

There are 4 slots you can use to inject things inside the scroller (it may be usefull to add a `thead` or `tbody`):

```html
<main>
  <slot name="before-container"></slot>
  <container>
    <slot name="before-content"></slot>
    <content>
      <!-- Your items here -->
    </content>
    <slot name="after-content"></slot>
  </container>
  <slot name="after-container"></slot>
</main>
```

## Server-Side Rendering

The `prerender` props can be set as the number of items to render on the server inside the virtual scroller:

```html
<virtual-scroller :items="items" item-height="42" page-mode prerender="10">
```

# Example

```html
<template>
  <div class="demo">
    <virtual-scroller
      class="scroller"
      :items="items"
      :renderers="renderers"
      item-height="22"
      type-field="type">
    </virtual-scroller>
  </div>
</template>

<script>
// Data with a type field
const items = [
  { type: 'letter', value: 'A' },
  { type: 'person', value: { name: 'Alan' } },
  { type: 'person', value: { name: 'Alice' } },
]

import Letter from './Letter.vue'
import Item from './Item.vue'

// Bind the components to the item type
const renderers = Object.freeze({
  letter: Letter,
  person: Item,
})

export default {
  data: () => ({
    items,
    renderers,
  }),
}
</script>

<style>
.scroller {
  height: 100%;
}

.scroller .item {
  height: 22px;
}
</style>
```

`Letter.vue` source:

```html
<template>
  <div class="letter">({{item.index}}) {{item.value}}</div>
</template>

<script>
export default {
  props: ['item'],
}
</script>
```

`Item.vue` source:

```html
<template>
  <div class="person" @click="edit">({{item.index}}) {{item.value.name}}</div>
</template>

<script>
export default {
  props: ['item'],
  methods: {
    edit () {
      this.item.value.name += '*'
    },
  },
}
</script>
```

---

## License

[MIT](http://opensource.org/licenses/MIT)

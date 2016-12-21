# vue-virtual-scroller

[![npm](https://img.shields.io/npm/v/vue-virtual-scroller.svg) ![npm](https://img.shields.io/npm/dm/vue-virtual-scroller.svg)](https://www.npmjs.com/package/vue-virtual-scroller)
[![vue2](https://img.shields.io/badge/vue-2.x-brightgreen.svg)](https://vuejs.org/)

Smooth scroll with any amount of data ([demo](https://akryum.github.io/vue-virtual-scroller/)).

# Installation

```
npm install --save vue-virtual-scroller
```

Use the component in your app. For example, register it as a global component:

```javascript
import { VirtualScroller } from 'vue-virtual-scroller'

Vue.component('virtual-scroller', VirtualScroller)
```

Or install it as a plugin:

```javascript
import VirtualScroller from 'vue-virtual-scroller'

Vue.use(VirtualScroller)
```

# Usage

The virtual scroller has three required props:

- `items` is the list of items you want to display in the scroller. There can be several types of item.
- `renderers` is a map of component definitions objects or names for each item type.
- `itemHeight` is the display height of the items in pixels used to calculate the scroll height and position.

There are additional props you can use:

- `typeField` to customize which field is used on the items to get their type and use the corresponding definition in the `renderers` map. The default is `'type'`.
- `keyField` to customize which field is used on the items to set their `key` special attribute (see [the documation](https://vuejs.org/v2/api/#key)). The default is `'id'`.

The `renderers` map is an object containing a component definition for each possible value of the item type. **The component definition must have an `item` prop, that will get the item object to render in the scroller.**

Also, you need to set the size of the virtual-scroller element and the items elements (for example, with CSS).

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
  height: 300px;
}

.scroller .item {
  height: 22px;
}
</style>
```

---

## License

[MIT](http://opensource.org/licenses/MIT)

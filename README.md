# vue-virtual-scroller
Smooth scroll with any amount of data ([demo](https://akryum.github.io/vue-virtual-scroller/)).

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

```html
<template>
  <div class="demo">
    <virtual-scroller
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
```

Finally, set the size of the virtual-scroller element (for example, with CSS).

---

## License

[MIT](http://opensource.org/licenses/MIT)

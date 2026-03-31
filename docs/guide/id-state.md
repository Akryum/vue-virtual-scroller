# IdState

`IdState` is a small convenience mixin for components rendered inside a [RecycleScroller](./recycle-scroller).

## Why is this useful?

`RecycleScroller` reuses component instances. That is great for performance, but it means ordinary Vue `data` can end up being shared across different items as views are recycled.

`IdState` gives you an `idState` object that behaves like local component state, but is scoped to a specific item identifier. You can change which identifier it uses with the `idProp` parameter.

## Example

In this example, the state is scoped to `item.id`:

```vue
<script>
import { IdState } from 'vue-virtual-scroller'

export default {
  mixins: [
    IdState({
      // You can customize this
      idProp: vm => vm.item.id,
    }),
  ],

  props: {
    // Item in the list
    item: Object,
  },

  // This replaces data () { ... }
  idState() {
    return {
      replyOpen: false,
      replyText: '',
    }
  },
}
</script>

<template>
  <div class="question">
    <p>{{ item.question }}</p>
    <button @click="idState.replyOpen = !idState.replyOpen">
      Reply
    </button>
    <textarea
      v-if="idState.replyOpen"
      v-model="idState.replyText"
      placeholder="Type your reply"
    />
  </div>
</template>
```

## Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `idProp` | `vm => vm.item.id` | Field name on the component (for example: `'id'`) or function returning the id. |

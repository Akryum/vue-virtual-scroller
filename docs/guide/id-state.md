# IdState

This is a convenience mixin that can replace `data` in components being rendered in a [RecycleScroller](./recycle-scroller).

## Why is this useful?

Since the components in RecycleScroller are reused, you can't directly use the Vue standard `data` properties: otherwise they will be shared with different items in the list!

IdState will instead provide an `idState` object which is equivalent to `$data`, but it's linked to a single item with its identifier (you can change which field with `idProp` param).

## Example

In this example, we use the `id` of the `item` to have a "scoped" state to the item:

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

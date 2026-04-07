<script setup>
import ShiftDocDemo from '../.vitepress/components/demos/ShiftDocDemo.vue'
</script>

# Shift Demo

This demo focuses on prepend anchoring. It shows what happens when older rows are inserted above the viewport, which is a common pattern in chat history and reverse timelines.

## Try it yourself

- Add older rows with shift enabled and confirm the visible content stays in place.
- Turn shift off and repeat the same action to see the viewport jump.
- Move to the middle of the list before prepending so the difference is easier to spot.

<ShiftDocDemo />

## Source code

```vue
<script setup lang="ts">
import { nextTick, ref, useTemplateRef } from 'vue'
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import { createMessages } from '../.vitepress/components/demos/demo-data'

const scroller = useTemplateRef<InstanceType<typeof DynamicScroller>>('scroller')
const basePool = createMessages(320, 911)
const shiftEnabled = ref(true)
const rows = ref(basePool.slice(120, 156))

async function prepend(count = 10) {
  rows.value = [
    ...basePool.slice(120 - count, 120),
    ...rows.value,
  ]
}

async function jumpToMiddle() {
  await nextTick()
  scroller.value?.scrollToItem(18, { align: 'center' })
}
</script>

<template>
  <DynamicScroller
    ref="scroller"
    :items="rows"
    :min-item-size="62"
    :shift="shiftEnabled"
  >
    <template #default="{ item, active }">
      <DynamicScrollerItem
        :item="item"
        :active="active"
        :size-dependencies="[item.message]"
      >
        {{ item.message }}
      </DynamicScrollerItem>
    </template>
  </DynamicScroller>
</template>
```

<script setup>
import ShiftDocDemo from '../.vitepress/components/demos/ShiftDocDemo.vue'
</script>

# Shift Demo

Use this demo to verify prepend anchoring when older rows are inserted at the beginning of the list.

What to try:

- Click `Prepend 10` with `Shift` enabled and confirm the visible rows stay in place.
- Turn `Shift` off and prepend again to see the viewport jump.
- Use `Jump to middle` before prepending so the difference is obvious.

<ShiftDocDemo />

## Relevant source code

```vue
<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import { createMessages } from '../.vitepress/components/demos/demo-data'

const scroller = ref<InstanceType<typeof DynamicScroller>>()
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

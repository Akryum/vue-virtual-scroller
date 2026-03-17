<script setup lang="ts">
import type { ItemWithSize, ScrollDirection, UpdateCallback, UpdateEventArgs } from '../types'
import { computed, ref } from 'vue'
import { useDynamicScroller } from '../composables/useDynamicScroller'
import RecycleScroller from './RecycleScroller.vue'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<{
  items: unknown[]
  keyField?: string
  direction?: ScrollDirection
  listTag?: string
  itemTag?: string
  minItemSize: number | string
  emitUpdate?: boolean
  skipHover?: boolean
}>(), {
  keyField: 'id',
  direction: 'vertical',
  listTag: 'div',
  itemTag: 'div',
  emitUpdate: false,
  skipHover: false
})

const emit = defineEmits<{
  update: UpdateEventArgs
  resize: []
  visible: []
}>()

// Template refs
const scroller = ref<InstanceType<typeof RecycleScroller>>()

// Derive the root DOM element from the scroller's exposed el ref
const scrollerEl = computed(() => scroller.value?.el)

const {
  itemsWithSize,
  forceUpdate,
  scrollToItem,
  getItemSize,
  scrollToBottom,
  onScrollerResize,
  onScrollerVisible,
} = useDynamicScroller(
  props,
  scroller,
  scrollerEl,
  {
    onResize: () => emit('resize'),
    onVisible: () => emit('visible'),
  },
)

function getDefaultSlotBindings(itemWithSize: unknown, index: number, active: boolean) {
  const typedItem = itemWithSize as ItemWithSize
  return {
    item: typedItem.item,
    index,
    active,
    itemWithSize: typedItem,
  }
}

const handleUpdate: UpdateCallback = (...args) => emit('update', ...args)

// Expose
defineExpose({
  scrollToItem,
  scrollToBottom,
  getItemSize,
  forceUpdate,
})
</script>

<template>
  <RecycleScroller
    ref="scroller"
    :items="itemsWithSize"
    :min-item-size="props.minItemSize"
    :direction="props.direction"
    key-field="id"
    :list-tag="props.listTag"
    :item-tag="props.itemTag"
    :emit-update="props.emitUpdate"
    :skip-hover="props.skipHover"
    v-bind="$attrs"
    @update="handleUpdate"
    @resize="onScrollerResize"
    @visible="onScrollerVisible"
  >
    <template #default="{ item: itemWithSize, index, active }">
      <slot v-bind="getDefaultSlotBindings(itemWithSize, index, active)" />
    </template>
    <template
      v-if="$slots.before"
      #before
    >
      <slot name="before" />
    </template>
    <template
      v-if="$slots.after"
      #after
    >
      <slot name="after" />
    </template>
    <template #empty>
      <slot name="empty" />
    </template>
  </RecycleScroller>
</template>

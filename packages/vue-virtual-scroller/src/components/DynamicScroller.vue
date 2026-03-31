<script setup lang="ts" generic="TItem">
import type { UseDynamicScrollerOptions, UseDynamicScrollerReturn } from '../composables/useDynamicScroller'
import type { CacheSnapshot, DynamicScrollerExposed, DynamicScrollerSlotProps, ItemWithSize, KeyValue, RecycleScrollerExposed, ScrollDirection } from '../types'
import { computed, ref } from 'vue'
import { useDynamicScroller } from '../composables/useDynamicScroller'
import RecycleScroller from './RecycleScroller.vue'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<{
  items: TItem[]
  keyField?: string
  direction?: ScrollDirection
  listTag?: string
  itemTag?: string
  minItemSize: number | string
  shift?: boolean
  cache?: CacheSnapshot
}>(), {
  keyField: 'id',
  direction: 'vertical',
  listTag: 'div',
  itemTag: 'div',
  shift: false,
  cache: undefined,
})

const emit = defineEmits<{
  resize: []
  visible: []
}>()

defineSlots<{
  default?: (props: DynamicScrollerSlotProps<TItem, KeyValue>) => unknown
  before?: () => unknown
  after?: () => unknown
  empty?: () => unknown
}>()

// Template refs
const scroller = ref<RecycleScrollerExposed<ItemWithSize<TItem, KeyValue>, KeyValue>>()

// Derive the root DOM element from the scroller's exposed el ref
const scrollerEl = computed(() => {
  const exposedEl = scroller.value?.el as unknown
  if (exposedEl && typeof exposedEl === 'object' && 'value' in exposedEl) {
    return (exposedEl as { value: HTMLElement | undefined }).value
  }
  return exposedEl as HTMLElement | undefined
})

const dynamicOptions = computed(() => ({
  items: props.items,
  keyField: props.keyField,
  direction: props.direction,
  minItemSize: props.minItemSize,
  shift: props.shift,
  cache: props.cache,
  el: scrollerEl.value,
  onResize: () => emit('resize'),
  onVisible: () => emit('visible'),
}) as unknown as UseDynamicScrollerOptions<TItem, any>)

const dynamicScroller = useDynamicScroller(
  dynamicOptions,
) as unknown as UseDynamicScrollerReturn<TItem, KeyValue>

const {
  itemsWithSize,
  forceUpdate,
  scrollToItem,
  scrollToPosition,
  findItemIndex,
  getItemOffset,
  getItemSize,
  cacheSnapshot,
  restoreCache,
  scrollToBottom,
  onScrollerResize,
  onScrollerVisible,
} = dynamicScroller

function getDefaultSlotBindings(
  itemWithSize: ItemWithSize<TItem, KeyValue>,
  index: number,
  active: boolean,
): DynamicScrollerSlotProps<TItem, KeyValue> {
  return {
    item: itemWithSize.item,
    index,
    active,
    itemWithSize,
  }
}

// Expose
const exposed: DynamicScrollerExposed<TItem> = {
  scrollToItem,
  scrollToPosition,
  findItemIndex,
  getItemOffset,
  scrollToBottom,
  getItemSize,
  cacheSnapshot,
  restoreCache,
  forceUpdate,
}

defineExpose(exposed)
</script>

<template>
  <RecycleScroller
    ref="scroller"
    :items="itemsWithSize"
    :min-item-size="props.minItemSize"
    :direction="props.direction"
    :cache="props.cache"
    key-field="id"
    :list-tag="props.listTag"
    :item-tag="props.itemTag"
    v-bind="$attrs"
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

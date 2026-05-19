<script setup lang="ts" generic="TItem">
import type { UseDynamicScrollerOptions, UseDynamicScrollerReturn } from '../composables/useDynamicScroller'
import type { CacheSnapshot, DynamicScrollerExposed, DynamicScrollerSlotProps, ItemWithSize, KeyFieldValue, KeyValue, RecycleScrollerExposed, ScrollDirection } from '../types'
import { computed, ref, toRef } from 'vue'
import { useDynamicScroller } from '../composables/useDynamicScroller'
import RecycleScroller from './RecycleScroller.vue'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<{
  items: TItem[]
  keyField?: KeyFieldValue<any>
  direction?: ScrollDirection
  listTag?: string
  itemTag?: string
  minItemSize: number | string
  shift?: boolean
  cache?: CacheSnapshot
  disableTransform?: boolean
  flowMode?: boolean
  hiddenPosition?: number
  enabled?: boolean
  /**
   * Mirror of `RecycleScroller`'s `pageMode`: render against an outer scroll
   * parent (page or ancestor) instead of giving the scroller its own
   * scrollable box.
   */
  pageMode?: boolean
  /**
   * Override the auto-detected scroll-parent used when `pageMode` is on.
   * Accepts an HTMLElement or `Window`. When omitted, the closest scrollable
   * ancestor is used. See issue #928.
   */
  scrollParent?: HTMLElement | Window
}>(), {
  keyField: 'id',
  direction: 'vertical',
  listTag: 'div',
  itemTag: 'div',
  shift: false,
  cache: undefined,
  disableTransform: false,
  flowMode: false,
  hiddenPosition: undefined,
  enabled: true,
  pageMode: false,
  scrollParent: undefined,
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
const items = toRef(props, 'items')

// Derive the root DOM element from the scroller's exposed el ref
const scrollerEl = computed(() => {
  const exposedEl = scroller.value?.el as unknown
  if (exposedEl && typeof exposedEl === 'object' && 'value' in exposedEl) {
    return (exposedEl as { value: HTMLElement | undefined }).value
  }
  return exposedEl as HTMLElement | undefined
})

const dynamicOptions = computed(() => ({
  items,
  keyField: props.keyField,
  direction: props.direction,
  minItemSize: props.minItemSize,
  shift: props.shift,
  cache: props.cache,
  flowMode: props.flowMode,
  hiddenPosition: props.hiddenPosition,
  enabled: props.enabled,
  pageMode: props.pageMode,
  scrollParent: props.scrollParent,
  el: scrollerEl.value,
  onResize: () => emit('resize'),
  onVisible: () => emit('visible'),
}) as unknown as UseDynamicScrollerOptions<TItem>)

const dynamicScroller = useDynamicScroller(
  dynamicOptions,
) as unknown as UseDynamicScrollerReturn<TItem, KeyValue>

const {
  itemsWithSize,
  forceUpdate,
  startSpacerSize,
  endSpacerSize,
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
  startSpacerSize,
  endSpacerSize,
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
    :disable-transform="props.disableTransform"
    :flow-mode="props.flowMode"
    :hidden-position="props.hiddenPosition"
    :enabled="props.enabled"
    :page-mode="props.pageMode"
    :scroll-parent="props.scrollParent"
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

<script setup lang="ts">
import type { ScrollDirection } from '../types'
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
}>(), {
  keyField: 'id',
  direction: 'vertical',
  listTag: 'div',
  itemTag: 'div',
})

const emit = defineEmits<{
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
    v-bind="$attrs"
    @resize="onScrollerResize"
    @visible="onScrollerVisible"
  >
    <template #default="{ item: itemWithSize, index, active }">
      <slot
        v-bind="{
          item: itemWithSize.item,
          index,
          active,
          itemWithSize,
        }"
      />
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

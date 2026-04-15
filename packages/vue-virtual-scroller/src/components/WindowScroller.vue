<script setup lang="ts" generic="TItem">
import type { ScrollerCallbacks } from '../composables/scrollerOptions'
import type { UseWindowScrollerOptions, UseWindowScrollerReturn } from '../composables/useWindowScroller'
import type { CacheSnapshot, ClassValue, ItemSizeValue, KeyFieldValue, KeyValue, RecycleScrollerSlotProps, ScrollDirection, WindowScrollerExposed } from '../types'
import { computed, ref, toRef } from 'vue'
import { useWindowScroller } from '../composables/useWindowScroller'
import { ObserveVisibility } from '../directives/observeVisibility'
import ItemView from './ItemView.vue'
import ResizeObserver from './ResizeObserver.vue'

const props = withDefaults(defineProps<{
  items: TItem[]
  keyField?: KeyFieldValue<any>
  direction?: ScrollDirection
  listTag?: string
  itemTag?: string
  itemSize?: ItemSizeValue<TItem>
  gridItems?: number
  itemSecondarySize?: number
  minItemSize?: number | string | null
  sizeField?: string
  typeField?: string
  buffer?: number
  shift?: boolean
  cache?: CacheSnapshot
  prerender?: number
  emitUpdate?: boolean
  disableTransform?: boolean
  hiddenPosition?: number
  updateInterval?: number
  listClass?: ClassValue
  itemClass?: ClassValue
}>(), {
  keyField: 'id',
  direction: 'vertical',
  listTag: 'div',
  itemTag: 'div',
  itemSize: null,
  gridItems: undefined,
  itemSecondarySize: undefined,
  minItemSize: null,
  sizeField: 'size',
  typeField: 'type',
  buffer: 200,
  shift: false,
  cache: undefined,
  prerender: 0,
  emitUpdate: false,
  disableTransform: false,
  hiddenPosition: undefined,
  updateInterval: 0,
  listClass: '',
  itemClass: '',
})

const emit = defineEmits<{
  resize: []
  visible: []
  hidden: []
  update: [startIndex: number, endIndex: number, visibleStartIndex: number, visibleEndIndex: number]
}>()

defineSlots<{
  default?: (props: RecycleScrollerSlotProps<TItem>) => unknown
  before?: () => unknown
  after?: () => unknown
  empty?: () => unknown
}>()

const vObserveVisibility = ObserveVisibility
const el = ref<HTMLElement>()
const before = ref<HTMLElement>()
const after = ref<HTMLElement>()
const items = toRef(props, 'items')
const windowScrollerOptions = computed(() => ({
  items,
  el,
  before,
  after,
  keyField: props.keyField,
  direction: props.direction,
  itemSize: props.itemSize,
  gridItems: props.gridItems,
  itemSecondarySize: props.itemSecondarySize,
  minItemSize: props.minItemSize,
  sizeField: props.sizeField,
  typeField: props.typeField,
  buffer: props.buffer,
  shift: props.shift,
  cache: props.cache,
  prerender: props.prerender,
  emitUpdate: props.emitUpdate,
  disableTransform: props.disableTransform,
  hiddenPosition: props.hiddenPosition,
  updateInterval: props.updateInterval,
  onResize: () => emit('resize'),
  onVisible: () => emit('visible'),
  onHidden: () => emit('hidden'),
  onUpdate: (startIndex: number, endIndex: number, visibleStartIndex: number, visibleEndIndex: number) =>
    emit('update', startIndex, endIndex, visibleStartIndex, visibleEndIndex),
}) as UseWindowScrollerOptions<TItem, 'size'> & ScrollerCallbacks)

const windowScroller = useWindowScroller(
  windowScrollerOptions,
) as unknown as UseWindowScrollerReturn<TItem, KeyValue>

const {
  pool,
  totalSize,
  ready,
  scrollToItem,
  scrollToPosition,
  getScroll,
  findItemIndex,
  getItemOffset,
  getItemSize,
  getViewStyle,
  cacheSnapshot,
  restoreCache,
  updateVisibleItems,
  handleResize,
  handleVisibilityChange,
} = windowScroller

const exposed: WindowScrollerExposed<TItem, KeyValue> = {
  el,
  scrollToItem,
  scrollToPosition,
  getScroll,
  findItemIndex,
  getItemOffset,
  getItemSize,
  cacheSnapshot,
  restoreCache,
  updateVisibleItems,
}

defineExpose(exposed)
</script>

<template>
  <div
    ref="el"
    v-observe-visibility="handleVisibilityChange"
    class="vue-recycle-scroller vue-window-scroller"
    :class="{
      ready,
      [`direction-${props.direction}`]: true,
    }"
  >
    <div
      v-if="$slots.before"
      ref="before"
      class="vue-recycle-scroller__slot"
    >
      <slot name="before" />
    </div>

    <component
      :is="props.listTag"
      :style="{ [props.direction === 'vertical' ? 'minHeight' : 'minWidth']: `${totalSize}px` }"
      class="vue-recycle-scroller__item-wrapper"
      :class="props.listClass"
    >
      <ItemView
        v-for="view of pool"
        :key="view.nr.id"
        :view="view"
        :item-tag="props.itemTag"
        :style="ready ? getViewStyle(view) : null"
        class="vue-recycle-scroller__item-view"
        :class="props.itemClass"
      >
        <template #default="slotProps">
          <slot v-bind="slotProps" />
        </template>
      </ItemView>

      <slot
        v-if="props.items.length === 0"
        name="empty"
      />
    </component>

    <div
      v-if="$slots.after"
      ref="after"
      class="vue-recycle-scroller__slot"
    >
      <slot name="after" />
    </div>

    <ResizeObserver @notify="handleResize" />
  </div>
</template>

<style src="./scroller.css"></style>

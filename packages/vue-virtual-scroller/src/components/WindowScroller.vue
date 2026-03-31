<script setup lang="ts" generic="TItem">
import type { UseWindowScrollerOptions, UseWindowScrollerReturn } from '../composables/useWindowScroller'
import type { CacheSnapshot, ClassValue, KeyValue, RecycleScrollerSlotProps, ScrollDirection, WindowScrollerExposed } from '../types'
import { ref } from 'vue'
import { useWindowScroller } from '../composables/useWindowScroller'
import { ObserveVisibility } from '../directives/observeVisibility'
import ItemView from './ItemView.vue'
import ResizeObserver from './ResizeObserver.vue'

const props = withDefaults(defineProps<{
  items: TItem[]
  keyField?: string
  direction?: ScrollDirection
  listTag?: string
  itemTag?: string
  itemSize?: number | null
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

const windowScroller = useWindowScroller(
  props as unknown as UseWindowScrollerOptions<TItem, any, 'size'>,
  el,
  before,
  after,
  {
    onResize: () => emit('resize'),
    onVisible: () => emit('visible'),
    onHidden: () => emit('hidden'),
    onUpdate: (startIndex, endIndex, visibleStartIndex, visibleEndIndex) =>
      emit('update', startIndex, endIndex, visibleStartIndex, visibleEndIndex),
  },
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
  cacheSnapshot,
  restoreCache,
  updateVisibleItems,
  handleScroll,
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
    @scroll.passive="handleScroll"
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
        :style="ready
          ? [
            (props.disableTransform
              ? { [props.direction === 'vertical' ? 'top' : 'left']: `${view.position}px`, willChange: 'unset' }
              : { transform: `translate${props.direction === 'vertical' ? 'Y' : 'X'}(${view.position}px) translate${props.direction === 'vertical' ? 'X' : 'Y'}(${view.offset}px)` }),
            {
              width: props.gridItems ? `${props.direction === 'vertical' ? props.itemSecondarySize || props.itemSize : props.itemSize}px` : undefined,
              height: props.gridItems ? `${props.direction === 'horizontal' ? props.itemSecondarySize || props.itemSize : props.itemSize}px` : undefined,
              visibility: view.nr.used ? 'visible' : 'hidden',
            },
          ]
          : null"
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

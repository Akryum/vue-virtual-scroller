<script setup lang="ts" generic="TItem">
import type { UseRecycleScrollerOptions, UseRecycleScrollerReturn } from '../composables/useRecycleScroller'
import type { CacheSnapshot, ClassValue, KeyValue, RecycleScrollerExposed, RecycleScrollerSlotProps, ScrollDirection } from '../types'
import { computed, ref } from 'vue'
import { useRecycleScroller } from '../composables/useRecycleScroller'
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
  pageMode?: boolean
  shift?: boolean
  cache?: CacheSnapshot
  prerender?: number
  emitUpdate?: boolean
  disableTransform?: boolean
  updateInterval?: number
  skipHover?: boolean
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
  pageMode: false,
  shift: false,
  cache: undefined,
  prerender: 0,
  emitUpdate: false,
  disableTransform: false,
  updateInterval: 0,
  skipHover: false,
  listClass: '',
  itemClass: '',
})

const emit = defineEmits<{
  resize: []
  visible: []
  hidden: []
  update: [startIndex: number, endIndex: number, visibleStartIndex: number, visibleEndIndex: number]
  scrollStart: []
  scrollEnd: []
}>()

defineSlots<{
  default?: (props: RecycleScrollerSlotProps<TItem>) => unknown
  before?: () => unknown
  after?: () => unknown
  empty?: () => unknown
}>()

const vObserveVisibility = ObserveVisibility

// Template refs
const el = ref<HTMLElement>()
const before = ref<HTMLElement>()
const after = ref<HTMLElement>()

// Hover state (UI-specific, not in composable)
const hoverKey = ref<KeyValue | null>(null)

const recycleScroller = useRecycleScroller(
  props as unknown as UseRecycleScrollerOptions<TItem, any, 'size'>,
  el,
  before,
  after,
  {
    onResize: () => emit('resize'),
    onVisible: () => emit('visible'),
    onHidden: () => emit('hidden'),
    onUpdate: (startIndex, endIndex, visibleStartIndex, visibleEndIndex) => {
      emit('update', startIndex, endIndex, visibleStartIndex, visibleEndIndex)
      if (visibleStartIndex <= 0) {
        emit('scrollStart')
      }
      if (visibleEndIndex >= props.items.length - 1) {
        emit('scrollEnd')
      }
    },
  },
) as unknown as UseRecycleScrollerReturn<TItem, KeyValue>

const {
  pool,
  visiblePool,
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
} = recycleScroller

function setHoverKey(key: KeyValue) {
  hoverKey.value = key
}

function clearHoverKey() {
  hoverKey.value = null
}

const itemWrapperStyle = computed(() => {
  const listStyle: Record<string, string> = {
    [props.direction === 'vertical' ? 'minHeight' : 'minWidth']: `${totalSize.value}px`,
  }

  if (props.gridItems && props.itemSize != null) {
    const crossAxisSize = (props.itemSecondarySize || props.itemSize) * props.gridItems
    listStyle[props.direction === 'vertical' ? 'minWidth' : 'minHeight'] = `${crossAxisSize}px`
  }

  return listStyle
})

// Expose public methods and el ref
const exposed: RecycleScrollerExposed<TItem, KeyValue> = {
  el,
  visiblePool,
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
    class="vue-recycle-scroller"
    :class="{
      'grid-mode': props.gridItems,
      ready,
      'page-mode': props.pageMode,
      [`direction-${props.direction}`]: true,
    }"
    @scroll.passive="handleScroll"
  >
    <div
      v-if="$slots.before"
      ref="before"
      class="vue-recycle-scroller__slot"
    >
      <slot
        name="before"
      />
    </div>

    <component
      :is="props.listTag"
      :style="itemWrapperStyle"
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
        :class="[
          props.itemClass,
          {
            hover: !props.skipHover && hoverKey === view.nr.key,
          },
        ]"
        v-on="props.skipHover ? {} : {
          mouseenter: () => { setHoverKey(view.nr.key) },
          mouseleave: () => { clearHoverKey() },
        }"
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
      <slot
        name="after"
      />
    </div>

    <ResizeObserver @notify="handleResize" />
  </div>
</template>

<style src="./scroller.css"></style>

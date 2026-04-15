<script setup lang="ts" generic="TItem">
import type { ScrollerCallbacks } from '../composables/scrollerOptions'
import type { UseRecycleScrollerOptions, UseRecycleScrollerReturn } from '../composables/useRecycleScroller'
import type { CacheSnapshot, ClassValue, ItemSizeValue, KeyFieldValue, KeyValue, RecycleScrollerExposed, RecycleScrollerSlotProps, ScrollDirection } from '../types'
import { computed, ref, toRef } from 'vue'
import { useRecycleScroller } from '../composables/useRecycleScroller'
import { ObserveVisibility } from '../directives/observeVisibility'
import { getFixedItemSize } from '../utils/itemSize'
import { resolvePooledViewMode } from '../utils/viewStyle'
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
  pageMode?: boolean
  shift?: boolean
  cache?: CacheSnapshot
  prerender?: number
  emitUpdate?: boolean
  disableTransform?: boolean
  flowMode?: boolean
  hiddenPosition?: number
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
  flowMode: false,
  hiddenPosition: undefined,
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

/**
 * Keep the items array as a ref to ensure reactivity, while allowing the useRecycleScroller composable to work with a stable reference to it. This avoids unnecessary recomputations in the composable when the items array is replaced.
 */
const items = toRef(props, 'items')

/**
 * Keep cold props reactive while passing hot refs like `items` and `el` through stable handles.
 */
const recycleScrollerOptions = computed(() => ({
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
  pageMode: props.pageMode,
  shift: props.shift,
  cache: props.cache,
  prerender: props.prerender,
  emitUpdate: props.emitUpdate,
  disableTransform: props.disableTransform,
  flowMode: props.flowMode,
  hiddenPosition: props.hiddenPosition,
  updateInterval: props.updateInterval,
  onResize: () => emit('resize'),
  onVisible: () => emit('visible'),
  onHidden: () => emit('hidden'),
  onUpdate: (startIndex: number, endIndex: number, visibleStartIndex: number, visibleEndIndex: number) => {
    emit('update', startIndex, endIndex, visibleStartIndex, visibleEndIndex)
    if (visibleStartIndex <= 0) {
      emit('scrollStart')
    }
    if (visibleEndIndex >= props.items.length - 1) {
      emit('scrollEnd')
    }
  },
}) as UseRecycleScrollerOptions<TItem, 'size'> & ScrollerCallbacks)

const recycleScroller = useRecycleScroller(
  recycleScrollerOptions,
) as unknown as UseRecycleScrollerReturn<TItem, KeyValue>

const {
  pool,
  visiblePool,
  totalSize,
  startSpacerSize,
  endSpacerSize,
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
} = recycleScroller

const isFlowMode = computed(() =>
  resolvePooledViewMode({
    direction: props.direction,
    disableTransform: props.disableTransform,
    flowMode: props.flowMode,
    gridItems: props.gridItems,
  }) === 'flow',
)

const startSpacerStyle = computed(() => ({
  height: `${startSpacerSize.value}px`,
}))

const endSpacerStyle = computed(() => ({
  height: `${endSpacerSize.value}px`,
}))

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

  const fixedItemSize = getFixedItemSize(props.itemSize)
  if (props.gridItems && fixedItemSize != null) {
    const crossAxisSize = (props.itemSecondarySize || fixedItemSize) * props.gridItems
    listStyle[props.direction === 'vertical' ? 'minWidth' : 'minHeight'] = `${crossAxisSize}px`
  }

  return listStyle
})

// Expose public methods and el ref
const exposed: RecycleScrollerExposed<TItem, KeyValue> = {
  el,
  visiblePool,
  startSpacerSize,
  endSpacerSize,
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
      'flow-mode': isFlowMode,
      ready,
      'page-mode': props.pageMode,
      [`direction-${props.direction}`]: true,
    }"
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
      <component
        :is="props.itemTag"
        v-if="isFlowMode && startSpacerSize > 0"
        aria-hidden="true"
        class="vue-recycle-scroller__item-spacer"
        :style="startSpacerStyle"
      />

      <ItemView
        v-for="view of pool"
        :key="view.nr.id"
        :view="view"
        :item-tag="props.itemTag"
        :style="ready ? getViewStyle(view) : null"
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

      <component
        :is="props.itemTag"
        v-if="isFlowMode && endSpacerSize > 0"
        aria-hidden="true"
        class="vue-recycle-scroller__item-spacer"
        :style="endSpacerStyle"
      />

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

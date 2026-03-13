<script setup lang="ts">
import type { ScrollDirection } from '../types'
import { ref } from 'vue'
import { useRecycleScroller } from '../composables/useRecycleScroller'
import { ObserveVisibility } from '../directives/observeVisibility'
import ItemView from './ItemView.vue'
import ResizeObserver from './ResizeObserver.vue'

const props = withDefaults(defineProps<{
  items: unknown[]
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
  prerender?: number
  emitUpdate?: boolean
  disableTransform?: boolean
  updateInterval?: number
  skipHover?: boolean
  listClass?: string | Record<string, boolean> | Array<string | Record<string, boolean>>
  itemClass?: string | Record<string, boolean> | Array<string | Record<string, boolean>>
  reuseByKey?: boolean
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
  prerender: 0,
  emitUpdate: false,
  disableTransform: false,
  updateInterval: 0,
  skipHover: false,
  listClass: '',
  itemClass: '',
  reuseByKey: false,
})

const emit = defineEmits<{
  'resize': []
  'visible': []
  'hidden': []
  'update': [startIndex: number, endIndex: number, visibleStartIndex: number, visibleEndIndex: number]
  'scroll-start': []
  'scroll-end': []
}>()

const vObserveVisibility = ObserveVisibility

// Template refs
const el = ref<HTMLElement>()
const before = ref<HTMLElement>()
const after = ref<HTMLElement>()

// Hover state (UI-specific, not in composable)
const hoverKey = ref<string | number | null>(null)

const {
  pool,
  totalSize,
  ready,
  scrollToItem,
  scrollToPosition,
  getScroll,
  updateVisibleItems,
  handleScroll,
  handleResize,
  handleVisibilityChange,
} = useRecycleScroller(
  props,
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
)

// Expose public methods and el ref
defineExpose({
  el,
  scrollToItem,
  scrollToPosition,
  getScroll,
  updateVisibleItems,
})
</script>

<template>
  <div
    ref="el"
    v-observe-visibility="handleVisibilityChange"
    class="vue-recycle-scroller"
    :class="{
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
        :class="[
          props.itemClass,
          {
            hover: !props.skipHover && hoverKey === view.nr.key,
          },
        ]"
        v-on="props.skipHover ? {} : {
          mouseenter: () => { hoverKey = view.nr.key },
          mouseleave: () => { hoverKey = null },
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

<style>
.vue-recycle-scroller {
  position: relative;
}

.vue-recycle-scroller.direction-vertical:not(.page-mode) {
  overflow-y: auto;
}

.vue-recycle-scroller.direction-horizontal:not(.page-mode) {
  overflow-x: auto;
}

.vue-recycle-scroller.direction-horizontal {
  display: flex;
}

.vue-recycle-scroller__slot {
  flex: auto 0 0;
}

.vue-recycle-scroller__item-wrapper {
  flex: 1;
  box-sizing: border-box;
  overflow: hidden;
  position: relative;
}

.vue-recycle-scroller.ready .vue-recycle-scroller__item-view {
  position: absolute;
  top: 0;
  left: 0;
  will-change: transform;
}

.vue-recycle-scroller.direction-vertical .vue-recycle-scroller__item-wrapper {
  width: 100%;
}

.vue-recycle-scroller.direction-horizontal .vue-recycle-scroller__item-wrapper {
  height: 100%;
}

.vue-recycle-scroller.ready.direction-vertical .vue-recycle-scroller__item-view {
  width: 100%;
}

.vue-recycle-scroller.ready.direction-horizontal .vue-recycle-scroller__item-view {
  height: 100%;
}
</style>

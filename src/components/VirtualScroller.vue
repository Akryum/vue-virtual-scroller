<template>
  <component :is="mainTag" class="virtual-scroller" :class="cssClass" @scroll="updateVisibleItems" v-observe-visibility="handleVisibilityChange">
    <slot name="before-container"></slot>
    <component :is="containerTag" class="item-container" :class="containerClass" :style="itemContainerStyle">
      <slot name="before-content"></slot>
      <component :is="contentTag" class="items" :class="contentClass" :style="itemsStyle">
        <template v-if="renderers">
          <component class="item" v-for="(item, index) in visibleItems" :key="keysEnabled && item[keyField]" :is="renderers[item[typeField]]" :item="item" :item-index="_startIndex + index"></component>
        </template>
        <template v-else>
          <slot class="item" v-for="(item, index) in visibleItems" :item="item" :item-index="_startIndex + index" :item-key="keysEnabled && item[keyField]"></slot>
        </template>
      </component>
      <slot name="after-content"></slot>
    </component>
    <slot name="after-container"></slot>
    <resize-observer @notify="updateVisibleItems" />
  </component>
</template>

<script>
import { ResizeObserver } from 'vue-resize'
import { ObserveVisibility } from 'vue-observe-visibility'

export default {
  name: 'virtual-scroller',

  components: {
    ResizeObserver,
  },

  directives: {
    ObserveVisibility,
  },

  props: {
    items: {
      type: Array,
      required: true,
    },
    renderers: {
      default: null,
    },
    itemHeight: {
      type: [Number, String],
      required: true,
    },
    typeField: {
      type: String,
      default: 'type',
    },
    keyField: {
      type: String,
      default: 'id',
    },
    mainTag: {
      type: String,
      default: 'div',
    },
    containerTag: {
      type: String,
      default: 'div',
    },
    containerClass: {
      default: null,
    },
    contentTag: {
      type: String,
      default: 'div',
    },
    contentClass: {
      default: null,
    },
    pageMode: {
      type: Boolean,
      default: false,
    },
    buffer: {
      type: [Number, String],
      default: 2,
    },
    poolSize: {
      type: [Number, String],
      default: 1,
    },
  },

  data: () => ({
    visibleItems: [],
    itemContainerStyle: null,
    itemsStyle: null,
    keysEnabled: true,
  }),

  computed: {
    cssClass () {
      return {
        'page-mode': this.pageMode,
      }
    },
  },

  watch: {
    items () {
      this.updateVisibleItems()
    },
    pageMode () {
      this.applyPageMode()
      this.updateVisibleItems()
    },
  },

  methods: {
    getScroll () {
      const el = this.$el
      let scroll

      if (this.pageMode) {
        const rect = el.getBoundingClientRect()
        let top = -rect.top
        let height = window.innerHeight
        if (top < 0) {
          height += top
          top = 0
        }
        if (top + height > rect.height) {
          height = rect.height - top
        }
        scroll = {
          top: top,
          bottom: top + height,
        }
      } else {
        scroll = {
          top: el.scrollTop,
          bottom: el.scrollTop + el.clientHeight,
        }
      }

      if (scroll.bottom >= 0 && scroll.top <= scroll.bottom) {
        return scroll
      } else {
        return null
      }
    },

    updateVisibleItems () {
      const l = this.items.length
      const scroll = this.getScroll()
      if (scroll) {
        let startIndex = Math.floor((Math.floor(scroll.top / this.itemHeight) - this.buffer) / this.poolSize) * this.poolSize
        let endIndex = Math.floor((Math.ceil(scroll.bottom / this.itemHeight) + this.buffer) / this.poolSize) * this.poolSize
        if (startIndex < 0) {
          startIndex = 0
        }
        if (endIndex > l) {
          endIndex = l
        }
        if (startIndex !== this._startIndex || endIndex !== this.endIndex) {
          this.keysEnabled = !(startIndex > this._endIndex || endIndex < this._startIndex)
          this._startIndex = startIndex
          this._endIndex = endIndex
          this.visibleItems = this.items.slice(startIndex, endIndex)
          this.itemContainerStyle = {
            height: l * this.itemHeight + 'px',
          }
          this.itemsStyle = {
            marginTop: startIndex * this.itemHeight + 'px',
          }
        }
      }
    },

    scrollToItem (index) {
      this.$el.scrollTop = index * this.itemHeight
    },

    handleVisibilityChange (isVisible, entry) {
      if (isVisible || entry.boundingClientRect.width !== 0 || entry.boundingClientRect.height !== 0) {
        this.$nextTick(() => {
          this.updateVisibleItems()
        })
      }
    },

    applyPageMode () {
      if (this.pageMode) {
        this.addWindowScroll()
      } else {
        this.removeWindowScroll()
      }
    },

    addWindowScroll () {
      window.addEventListener('scroll', this.updateVisibleItems, true)
    },

    removeWindowScroll () {
      window.removeEventListener('scroll', this.updateVisibleItems, true)
    },
  },

  mounted () {
    this.updateVisibleItems()
    this.applyPageMode()
  },

  beforeDestroy () {
    this.removeWindowScroll()
  },
}
</script>

<style scoped>
.virtual-scroller:not(.page-mode) {
  overflow-y: auto;
}

.item-container {
  box-sizing: border-box;
  width: 100%;
  overflow: hidden;
}

.items {
  width: 100%;
}
</style>

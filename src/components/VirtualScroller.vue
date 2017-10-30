<template>
  <component
    :is="mainTag"
    class="virtual-scroller"
    :class="cssClass"
    @scroll="handleScroll"
    v-observe-visibility="handleVisibilityChange"
  >
    <slot
      name="before-container"
    />
    <component
      ref="itemContainer"
      :is="containerTag"
      class="item-container"
      :class="containerClass"
      :style="itemContainerStyle"
    >
      <slot
        name="before-content"
      />
      <component
        ref="items"
        :is="contentTag"
        class="items"
        :class="contentClass"
        :style="itemsStyle"
      >
        <template v-if="renderers">
          <component
            class="item"
            v-for="(item, index) in visibleItems"
            :key="keysEnabled && item[keyField] || ''"
            :is="renderers[item[typeField]]"
            :item="item"
            :item-index="_startIndex + index"
          />
        </template>
        <template v-else>
          <slot
            class="item"
            v-for="(item, index) in visibleItems"
            :item="item"
            :item-index="_startIndex + index"
            :item-key="keysEnabled && item[keyField] || ''"
          />
        </template>
      </component>
      <slot
        name="after-content"
      />
    </component>
    <slot
      name="after-container"
    />
    <resize-observer @notify="handleResize" />
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
      default: null,
    },
    typeField: {
      type: String,
      default: 'type',
    },
    keyField: {
      type: String,
      default: 'id',
    },
    heightField: {
      type: String,
      default: 'height',
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
      default: 200,
    },
    poolSize: {
      type: [Number, String],
      default: 2000,
    },
    prerender: {
      type: [Number, String],
      default: 0,
    },
    emitUpdate: {
      type: Boolean,
      default: false,
    },
    delayPreviousItems: {
      type: Boolean,
      default: false,
    },
  },

  data () {
    return {
      visibleItems: [],
      itemContainerStyle: null,
      itemsStyle: null,
      keysEnabled: true,
    }
  },

  computed: {
    cssClass () {
      return {
        'page-mode': this.pageMode,
      }
    },

    heights () {
      if (this.itemHeight === null) {
        const heights = {}
        const items = this.items
        const field = this.heightField
        let accumulator = 0
        for (let i = 0; i < items.length; i++) {
          accumulator += items[i][field]
          heights[i] = accumulator
        }
        return heights
      }
    },
  },

  watch: {
    items: {
      handler () {
        this.updateVisibleItems(true)
      },
      deep: true,
    },
    pageMode () {
      this.applyPageMode()
      this.updateVisibleItems(true)
    },
    itemHeight: 'setDirty',
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

    updateVisibleItems (force = false) {
      const l = this.items.length
      const scroll = this.getScroll()
      const items = this.items
      const itemHeight = this.itemHeight
      let containerHeight, offsetTop
      if (scroll) {
        let startIndex = -1
        let endIndex = -1

        const buffer = parseInt(this.buffer)
        const poolSize = parseInt(this.poolSize)
        const scrollTop = ~~(scroll.top / poolSize) * poolSize - buffer
        const scrollBottom = Math.ceil(scroll.bottom / poolSize) * poolSize + buffer

        if (!force && ((scrollTop === this._oldScrollTop && scrollBottom === this._oldScrollBottom) || this._skip)) {
          this._skip = false
          return
        } else {
          this._oldScrollTop = scrollTop
          this._oldScrollBottom = scrollBottom
        }

        // Variable height mode
        if (itemHeight === null) {
          const heights = this.heights
          let h
          let a = 0
          let b = l - 1
          let i = ~~(l / 2)
          let oldI

          // Searching for startIndex
          do {
            oldI = i
            h = heights[i]
            if (h < scrollTop) {
              a = i
            } else if (i < l && heights[i + 1] > scrollTop) {
              b = i
            }
            i = ~~((a + b) / 2)
          } while (i !== oldI)
          i < 0 && (i = 0)
          startIndex = i

          // For containers style
          offsetTop = i > 0 ? heights[i - 1] : 0
          containerHeight = heights[l - 1]

          // Searching for endIndex
          for (endIndex = i; endIndex < l && heights[endIndex] < scrollBottom; endIndex++);
          if (endIndex === -1) {
            endIndex = items.length - 1
          } else {
            endIndex++
            // Bounds
            endIndex > l && (endIndex = l)
          }
        } else {
          // Fixed height mode
          startIndex = ~~(scrollTop / itemHeight)
          endIndex = Math.ceil(scrollBottom / itemHeight)

          // Bounds
          startIndex < 0 && (startIndex = 0)
          endIndex > l && (endIndex = l)

          offsetTop = startIndex * itemHeight
          containerHeight = l * itemHeight
        }

        if (
          force ||
          this._startIndex !== startIndex ||
          this._endIndex !== endIndex ||
          this._offsetTop !== offsetTop ||
          this._height !== containerHeight ||
          this._length !== l
        ) {
          this.keysEnabled = !(startIndex > this._endIndex || endIndex < this._startIndex)

          this.itemContainerStyle = {
            height: containerHeight + 'px',
          }
          this.itemsStyle = {
            marginTop: offsetTop + 'px',
          }

          if (this.delayPreviousItems) {
            // Add next items
            this.visibleItems = items.slice(this._startIndex, endIndex)
            // Remove previous items
            this.$nextTick(() => {
              this.visibleItems = items.slice(startIndex, endIndex)
            })
          } else {
            this.visibleItems = items.slice(startIndex, endIndex)
          }

          this.emitUpdate && this.$emit('update', startIndex, endIndex)

          this._startIndex = startIndex
          this._endIndex = endIndex
          this._length = l
          this._offsetTop = offsetTop
          this._height = containerHeight
        }
      }
    },

    scrollToItem (index) {
      let scrollTop
      if (this.itemHeight === null) {
        scrollTop = index > 0 ? this.heights[index - 1] : 0
      } else {
        scrollTop = index * this.itemHeight
      }
      this.$el.scrollTop = scrollTop
    },

    setDirty () {
      this._oldScrollTop = null
      this._oldScrollBottom = null
    },

    applyPageMode () {
      if (this.pageMode) {
        this.addWindowScroll()
      } else {
        this.removeWindowScroll()
      }
    },

    addWindowScroll () {
      window.addEventListener('scroll', this.handleScroll, true)
      window.addEventListener('resize', this.handleResize)
    },

    removeWindowScroll () {
      window.removeEventListener('scroll', this.handleScroll, true)
      window.removeEventListener('resize', this.handleResize)
    },

    handleScroll () {
      this.updateVisibleItems()
    },

    handleResize () {
      this.$emit('resize')
      this._ready && this.updateVisibleItems()
    },

    handleVisibilityChange (isVisible, entry) {
      if (this._ready && (isVisible || entry.boundingClientRect.width !== 0 || entry.boundingClientRect.height !== 0)) {
        this.$emit('visible')
        this.$nextTick(() => {
          this.updateVisibleItems()
        })
      }
    },
  },

  created () {
    this._ready = false
    this._startIndex = 0
    this._oldScrollTop = null
    this._oldScrollBottom = null
    this._offsetTop = 0
    this._height = 0
    const prerender = parseInt(this.prerender)
    if (prerender > 0) {
      this.visibleItems = this.items.slice(0, prerender)
      this._length = this.visibleItems.length
      this._endIndex = this._length - 1
      this._skip = true
    } else {
      this._endIndex = 0
      this._length = 0
      this._skip = false
    }
  },

  mounted () {
    this.applyPageMode()
    this.$nextTick(() => {
      this.updateVisibleItems(true)
      this._ready = true
      this.$nextTick(this.updateVisibleItems)
    })
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

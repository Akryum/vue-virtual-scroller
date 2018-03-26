<template>
  <component
    :is="mainTag"
    class="virtual-scroller"
    :class="cssClass"
    @scroll.passive="handleScroll"
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
            :key="keysEnabled && item[keyField] || undefined"
            :is="renderers[item[typeField]]"
            :item="item"
            :item-index="$_startIndex + index"
          />
        </template>
        <template v-else>
          <slot
            class="item"
            v-for="(item, index) in visibleItems"
            :item="item"
            :item-index="$_startIndex + index"
            :item-key="keysEnabled && item[keyField] || undefined"
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
import Scroller from '../mixins/scroller'

export default {
  name: 'virtual-scroller',

  mixins: [
    Scroller,
  ],

  props: {
    renderers: {
      default: null,
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
    poolSize: {
      type: [Number, String],
      default: 2000,
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

  created () {
    this.$_ready = false
    this.$_startIndex = 0
    this.$_oldScrollTop = null
    this.$_oldScrollBottom = null
    this.$_offsetTop = 0
    this.$_height = 0
    this.$_scrollDirty = false
    this.$_updateDirty = false

    const prerender = parseInt(this.prerender)
    if (prerender > 0) {
      this.visibleItems = this.items.slice(0, prerender)
      this.$_length = this.visibleItems.length
      this.$_endIndex = this.$_length - 1
      this.$_skip = true
    } else {
      this.$_endIndex = 0
      this.$_length = 0
      this.$_skip = false
    }
  },

  mounted () {
    this.applyPageMode()
    this.$nextTick(() => {
      this.updateVisibleItems(true)
      this.$_ready = true
    })
  },

  methods: {
    updateVisibleItems (force = false) {
      if (!this.$_updateDirty) {
        this.$_updateDirty = true
        this.$nextTick(() => {
          this.$_updateDirty = false

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

            if (!force && ((scrollTop === this.$_oldScrollTop && scrollBottom === this.$_oldScrollBottom) || this.$_skip)) {
              this.$_skip = false
              return
            } else {
              this.$_oldScrollTop = scrollTop
              this.$_oldScrollBottom = scrollBottom
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
                h = heights[i].accumulator
                if (h < scrollTop) {
                  a = i
                } else if (i < l - 1 && heights[i + 1].accumulator > scrollTop) {
                  b = i
                }
                i = ~~((a + b) / 2)
              } while (i !== oldI)
              i < 0 && (i = 0)
              startIndex = i

              // For containers style
              offsetTop = i > 0 ? heights[i - 1].accumulator : 0
              containerHeight = heights[l - 1].accumulator

              // Searching for endIndex
              for (endIndex = i; endIndex < l && heights[endIndex].accumulator < scrollBottom; endIndex++);
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
              this.$_startIndex !== startIndex ||
              this.$_endIndex !== endIndex ||
              this.$_offsetTop !== offsetTop ||
              this.$_height !== containerHeight ||
              this.$_length !== l
            ) {
              this.keysEnabled = !(startIndex > this.$_endIndex || endIndex < this.$_startIndex)

              this.itemContainerStyle = {
                height: containerHeight + 'px',
              }
              this.itemsStyle = {
                marginTop: offsetTop + 'px',
              }

              if (this.delayPreviousItems) {
                // Add next items
                this.visibleItems = items.slice(this.$_startIndex, endIndex)
                // Remove previous items
                this.$nextTick(() => {
                  this.visibleItems = items.slice(startIndex, endIndex)
                })
              } else {
                this.visibleItems = items.slice(startIndex, endIndex)
              }

              this.emitUpdate && this.$emit('update', startIndex, endIndex)

              this.$_startIndex = startIndex
              this.$_endIndex = endIndex
              this.$_length = l
              this.$_offsetTop = offsetTop
              this.$_height = containerHeight
            }
          }
        })
      }
    },

    setDirty () {
      this.$_oldScrollTop = null
      this.$_oldScrollBottom = null
    },

    handleScroll () {
      if (!this.$_scrollDirty) {
        this.$_scrollDirty = true
        requestAnimationFrame(() => {
          this.$_scrollDirty = false
          this.updateVisibleItems()
        })
      }
    },

    handleResize () {
      this.$emit('resize')
      this.$_ready && this.updateVisibleItems()
    },

    handleVisibilityChange (isVisible, entry) {
      if (this.$_ready && (isVisible || entry.boundingClientRect.width !== 0 || entry.boundingClientRect.height !== 0)) {
        this.$emit('visible')
        this.$nextTick(() => {
          this.updateVisibleItems()
        })
      }
    },
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

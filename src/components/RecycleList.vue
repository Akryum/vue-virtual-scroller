<template>
  <div
    class="recycle-list"
    :class="cssClass"
    @scroll.passive="handleScroll"
    v-observe-visibility="handleVisibilityChange"
  >
    <div
      ref="wrapper"
      class="item-wrapper"
      :style="{ height: totalHeight + 'px' }"
    >
      <div
        v-for="view of pool"
        :key="view.nr.id"
        class="item-view"
        :style="{ transform: 'translateY(' + view.top + 'px)' }"
      >
        <slot
          :item="view.item"
          :active="view.nr.used"
        />
      </div>
    </div>

    <slot
      name="after-container"
    />

    <resize-observer @notify="handleResize" />
  </div>
</template>

<script>
import Scroller from '../mixins/scroller'

let uid = 0

export default {
  name: 'RecycleList',

  mixins: [
    Scroller,
  ],

  props: {
    itemHeight: {
      type: Number,
      default: null,
    },
  },

  data () {
    return {
      pool: [],
      totalHeight: 0,
    }
  },

  watch: {
    items: {
      handler () {
        this.updateVisibleItems({
          checkItem: true,
        })
      },
    },
    pageMode () {
      this.applyPageMode()
      this.updateVisibleItems({
        checkItem: false,
      })
    },
    heights: {
      handler () {
        this.updateVisibleItems({
          checkItem: false,
        })
      },
      deep: true,
    },
  },

  created () {
    this.$_ready = false
    this.$_startIndex = 0
    this.$_endIndex = 0
    this.$_views = new Map()
    this.$_unusedViews = new Map()
    this.$_scrollDirty = false

    // TODO prerender
  },

  mounted () {
    this.applyPageMode()
    this.$nextTick(() => {
      this.updateVisibleItems({
        checkItem: true,
      })
      this.$_ready = true
    })
  },

  methods: {
    addView (index, item) {
      const view = {
        item,
        top: 0,
      }
      const nonReactive = {
        id: uid++,
        index,
        used: true,
      }
      Object.defineProperty(view, 'nr', {
        configurable: false,
        value: nonReactive,
      })
      this.pool.push(view)
      return view
    },

    unuseView (view, fake = false) {
      const unusedViews = this.$_unusedViews
      const type = view.item[this.typeField]
      let unusedPool = unusedViews.get(type)
      if (!unusedPool) {
        unusedPool = []
        unusedViews.set(type, unusedPool)
      }
      unusedPool.push(view)
      if (!fake) {
        view.nr.used = false
        view.top = -9999
        this.$_views.delete(view.item)
      }
    },

    handleResize () {
      this.$emit('resize')
      this.$_ready && this.updateVisibleItems({
        checkItem: false,
      })
    },

    handleScroll (event) {
      if (!this.$_scrollDirty) {
        this.$_scrollDirty = true
        requestAnimationFrame(() => {
          this.$_scrollDirty = false
          const { continuous } = this.updateVisibleItems({
            checkItem: false,
          })

          // It seems sometimes chrome doesn't fire scroll event :/
          // When non continous scrolling is ending, we force a refresh
          if (!continuous) {
            clearTimeout(this.$_refreshTimout)
            this.$_refreshTimout = setTimeout(this.handleScroll, 100)
          }
        })
      }
    },

    handleVisibilityChange (isVisible, entry) {
      if (this.$_ready && (isVisible || entry.boundingClientRect.width !== 0 || entry.boundingClientRect.height !== 0)) {
        this.$emit('visible')
        requestAnimationFrame(() => {
          this.updateVisibleItems({
            checkItem: false,
          })
        })
      }
    },

    updateVisibleItems ({ checkItem }) {
      const scroll = this.getScroll()
      const buffer = parseInt(this.buffer)
      scroll.top -= buffer
      scroll.bottom += buffer

      const itemHeight = this.itemHeight
      const typeField = this.typeField
      const items = this.items
      const count = items.length
      const heights = this.heights
      const views = this.$_views
      let unusedViews = this.$_unusedViews
      const pool = this.pool
      let startIndex, endIndex
      let totalHeight

      if (!count) {
        startIndex = endIndex = totalHeight = 0
      } else {
        // Variable height mode
        if (itemHeight === null) {
          let h
          let a = 0
          let b = count - 1
          let i = ~~(count / 2)
          let oldI

          // Searching for startIndex
          do {
            oldI = i
            h = heights[i].accumulator
            if (h < scroll.top) {
              a = i
            } else if (i < count - 1 && heights[i + 1].accumulator > scroll.top) {
              b = i
            }
            i = ~~((a + b) / 2)
          } while (i !== oldI)
          i < 0 && (i = 0)
          startIndex = i

          // For container style
          totalHeight = heights[count - 1].accumulator

          // Searching for endIndex
          for (endIndex = i; endIndex < count && heights[endIndex].accumulator < scroll.bottom; endIndex++);
          if (endIndex === -1) {
            endIndex = items.length - 1
          } else {
            endIndex++
            // Bounds
            endIndex > count && (endIndex = count)
          }
        } else {
          // Fixed height mode
          startIndex = ~~(scroll.top / itemHeight)
          endIndex = Math.ceil(scroll.bottom / itemHeight)

          // Bounds
          startIndex < 0 && (startIndex = 0)
          endIndex > count && (endIndex = count)

          totalHeight = count * itemHeight
        }
      }

      this.totalHeight = totalHeight

      let view

      const continuous = startIndex < this.$_endIndex && endIndex > this.$_startIndex
      let unusedIndex

      if (this.$_continuous !== continuous) {
        if (continuous) {
          views.clear()
          unusedViews.clear()
          for (let i = 0, l = pool.length; i < l; i++) {
            view = pool[i]
            this.unuseView(view)
          }
        }
        this.$_continuous = continuous
      } else if (continuous) {
        for (let i = 0, l = pool.length; i < l; i++) {
          view = pool[i]
          if (view.nr.used) {
            // Update view item index
            if (checkItem) view.nr.index = items.indexOf(view.item)

            // Check if index is still in visible range
            if (
              view.nr.index === -1 ||
              view.nr.index < startIndex ||
              view.nr.index > endIndex
            ) {
              this.unuseView(view)
            }
          }
        }
      }

      if (!continuous) {
        unusedIndex = new Map()
      }

      let item, type, unusedPool
      let v
      for (let i = startIndex; i < endIndex; i++) {
        item = items[i]
        view = views.get(item)

        if (!itemHeight && !heights[i].height) {
          if (view) this.unuseView(view)
          continue
        }

        // No view assigned to item
        if (!view) {
          type = item[typeField]

          if (continuous) {
            unusedPool = unusedViews.get(type)
            // Reuse existing view
            if (unusedPool && unusedPool.length) {
              view = unusedPool.pop()
              view.item = item
              view.nr.used = true
              view.nr.index = i
            } else {
              view = this.addView(i, item, type)
            }
          } else {
            unusedPool = unusedViews.get(type)
            v = unusedIndex.get(type) || 0
            // Use existing view
            // We don't care if they are already used
            // because we are not in continous scrolling
            if (unusedPool && v < unusedPool.length) {
              view = unusedPool[v]
              view.item = item
              view.nr.used = true
              view.nr.index = i
              unusedIndex.set(type, v + 1)
            } else {
              view = this.addView(i, item, type)
              this.unuseView(view, true)
            }
            v++
          }
          views.set(item, view)
        } else  {
          view.nr.used = true
        }

        // Update position
        if (itemHeight === null) {
          view.top = heights[i - 1].accumulator
        } else {
          view.top = i * itemHeight
        }
      }

      this.$_startIndex = startIndex
      this.$_endIndex = endIndex

      this.emitUpdate && this.$emit('update', startIndex, endIndex)

      return {
        continuous,
      }
    },
  },
}
</script>

<style scoped>
.recycle-list:not(.page-mode) {
  overflow-y: auto;
}

.item-wrapper {
  box-sizing: border-box;
  width: 100%;
  overflow: hidden;
  position: relative;
}

.item-view {
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  will-change: transform;
}
</style>

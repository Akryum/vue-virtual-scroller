<template>
  <div
    v-observe-visibility="handleVisibilityChange"
    class="vue-recycle-scroller"
    :class="{
      ready,
      'page-mode': pageMode,
    }"
    @scroll.passive="handleScroll"
  >
    <div
      v-if="$slots['before-container']"
      ref="beforeContent"
    >
      <slot
        name="before-container"
      />
    </div>

    <div
      ref="wrapper"
      :style="{ height: totalHeight + 'px' }"
      class="vue-recycle-scroller__item-wrapper"
    >
      <div
        v-for="view of pool"
        :key="view.nr.id"
        :style="ready ? { transform: 'translateY(' + view.top + 'px)' } : null"
        class="vue-recycle-scroller__item-view"
        :class="{ hover: hoverKey === view.nr.key }"
        @mouseenter="hoverKey = view.nr.key"
        @mouseleave="hoverKey = null"
      >
        <slot
          :item="view.item"
          :index="view.nr.index"
          :active="view.nr.used"
        />
      </div>
    </div>

    <slot
      name="after-container"
    />

    <ResizeObserver @notify="handleResize" />
  </div>
</template>

<script>
import Scroller from '../mixins/Scroller'
import config from '../config'

let uid = 0

export default {
  name: 'RecycleScroller',

  mixins: [
    Scroller,
  ],

  data () {
    return {
      pool: [],
      totalHeight: 0,
      ready: false,
      hoverKey: null,
    }
  },

  watch: {
    items () {
      this.updateVisibleItems(true)
    },

    pageMode () {
      this.applyPageMode()
      this.updateVisibleItems(false)
    },

    heights: {
      handler () {
        this.updateVisibleItems(false)
      },
      deep: true,
    },
  },

  created () {
    this.$_startIndex = 0
    this.$_endIndex = 0
    this.$_views = new Map()
    this.$_unusedViews = new Map()
    this.$_scrollDirty = false

    if (this.$isServer) {
      this.updateVisibleItems(false)
    }
  },

  mounted () {
    this.applyPageMode()
    this.$nextTick(() => {
      this.updateVisibleItems(true)
      this.ready = true
    })
  },

  methods: {
    addView (pool, index, item, key, type) {
      const view = {
        item,
        top: 0,
      }
      const nonReactive = {
        id: uid++,
        index,
        used: true,
        key,
        type,
      }
      Object.defineProperty(view, 'nr', {
        configurable: false,
        value: nonReactive,
      })
      pool.push(view)
      return view
    },

    unuseView (view, fake = false) {
      const unusedViews = this.$_unusedViews
      const type = view.nr.type
      let unusedPool = unusedViews.get(type)
      if (!unusedPool) {
        unusedPool = []
        unusedViews.set(type, unusedPool)
      }
      unusedPool.push(view)
      if (!fake) {
        view.nr.used = false
        view.top = -9999
        this.$_views.delete(view.nr.key)
      }
    },

    handleResize () {
      this.$emit('resize')
      if (this.ready) this.updateVisibleItems(false)
    },

    handleScroll (event) {
      if (!this.$_scrollDirty) {
        this.$_scrollDirty = true
        requestAnimationFrame(() => {
          this.$_scrollDirty = false
          const { continuous } = this.updateVisibleItems(false)

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
      if (this.ready) {
        if (isVisible || entry.boundingClientRect.width !== 0 || entry.boundingClientRect.height !== 0) {
          this.$emit('visible')
          requestAnimationFrame(() => {
            this.updateVisibleItems(false)
          })
        } else {
          this.$emit('hidden')
        }
      }
    },

    updateVisibleItems (checkItem) {
      const itemHeight = this.itemHeight
      const typeField = this.typeField
      const keyField = this.keyField
      const items = this.items
      const count = items.length
      const heights = this.heights
      const views = this.$_views
      let unusedViews = this.$_unusedViews
      const pool = this.pool
      let startIndex, endIndex
      let visibleStartIndex, visibleEndIndex
      let totalHeight

      if (!count) {
        startIndex = endIndex = visibleStartIndex = visibleEndIndex = totalHeight = 0
      } else if (this.$isServer) {
        startIndex = visibleStartIndex = 0
        endIndex = visibleEndIndex = this.prerender
        totalHeight = null
      } else {
        const scroll = this.getScroll()
        const visibleScrollTop = scroll.top
        const visibleScrollBottom = scroll.bottom
        scroll.top -= this.buffer
        scroll.bottom += this.buffer

        // get height of possible beforeContent
        const beforeContentHeight = this.$refs['beforeContent'] ? this.$refs['beforeContent'].getBoundingClientRect().height : 0

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

          // search visible startIndex
          for (visibleStartIndex = startIndex; visibleStartIndex < count && (beforeContentHeight + heights[visibleStartIndex].accumulator) < visibleScrollTop; visibleStartIndex++);

          // search visible endIndex
          for (visibleEndIndex = visibleStartIndex; visibleEndIndex < count && (beforeContentHeight + heights[visibleEndIndex].accumulator) < visibleScrollBottom; visibleEndIndex++);
        } else {
          // Fixed height mode
          startIndex = ~~(scroll.top / itemHeight)
          endIndex = Math.ceil(scroll.bottom / itemHeight)
          visibleStartIndex = Math.max(0, Math.floor((visibleScrollTop - beforeContentHeight) / itemHeight))
          visibleEndIndex = Math.floor((visibleScrollBottom - beforeContentHeight) / itemHeight)

          // Bounds
          startIndex < 0 && (startIndex = 0)
          endIndex > count && (endIndex = count)
          visibleStartIndex < 0 && (visibleStartIndex = 0)
          visibleEndIndex > count && (visibleEndIndex = count)

          totalHeight = count * itemHeight
        }
      }

      if (endIndex - startIndex > config.itemsLimit) {
        this.itemsLimitError()
      }

      this.totalHeight = totalHeight

      let view

      const continuous = startIndex <= this.$_endIndex && endIndex >= this.$_startIndex
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
            if (checkItem) {
              view.nr.index = items.findIndex(
                item => keyField ? item[keyField] === view.item[keyField] : item === view.item
              )
            }

            // Check if index is still in visible range
            if (
              view.nr.index === -1 ||
              view.nr.index < startIndex ||
              view.nr.index >= endIndex
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
        const key = keyField ? item[keyField] : item
        view = views.get(key)

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
              view.nr.key = key
              view.nr.type = type
            } else {
              view = this.addView(pool, i, item, key, type)
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
              view.nr.key = key
              view.nr.type = type
              unusedIndex.set(type, v + 1)
            } else {
              view = this.addView(pool, i, item, key, type)
              this.unuseView(view, true)
            }
            v++
          }
          views.set(key, view)
        } else {
          view.nr.used = true
          view.item = item
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

      if (this.emitUpdate) this.$emit('update', startIndex, endIndex, visibleStartIndex, visibleEndIndex)

      return {
        continuous,
      }
    },
  },
}
</script>

<style>
.vue-recycle-scroller {
  position: relative;
}

.vue-recycle-scroller:not(.page-mode) {
  overflow-y: auto;
}

.vue-recycle-scroller__item-wrapper {
  box-sizing: border-box;
  width: 100%;
  overflow: hidden;
  position: relative;
}

.vue-recycle-scroller.ready .vue-recycle-scroller__item-view {
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  will-change: transform;
}
</style>

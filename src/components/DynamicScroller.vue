<template>
  <RecycleScroller
    ref="scroller"
    :items="itemsWithHeight"
    :min-item-height="minItemHeight"
    v-bind="$attrs"
    @resize="onScrollerResize"
    @visible="onScrollerVisible"
    v-on="listeners"
  >
    <template slot-scope="{ item: itemWithHeight, index, active }">
      <slot
        v-bind="{
          item: itemWithHeight.item,
          index,
          active,
          itemWithHeight
        }"
      />
    </template>
    <template slot="before-container">
      <slot name="before-container" />
    </template>
    <template slot="after-container">
      <slot name="after-container" />
    </template>
  </RecycleScroller>
</template>

<script>
import RecycleScroller from './RecycleScroller.vue'

export default {
  name: 'DynamicScroller',

  components: {
    RecycleScroller,
  },

  inheritAttrs: false,

  provide () {
    return {
      vscrollData: this.vscrollData,
      vscrollBus: this,
    }
  },

  props: {
    items: {
      type: Array,
      required: true,
    },

    minItemHeight: {
      type: [Number, String],
      required: true,
    },

    keyField: {
      type: String,
      default: 'id',
    },
  },

  data () {
    return {
      vscrollData: {
        active: true,
        heights: {},
        keyField: this.keyField,
      },
    }
  },

  computed: {
    itemsWithHeight () {
      const result = []
      const items = this.items
      const keyField = this.keyField
      const heights = this.vscrollData.heights
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        const id = item[keyField]
        let height = heights[id]
        if (typeof height === 'undefined' && !this.$_undefinedMap[id]) {
          // eslint-disable-next-line vue/no-side-effects-in-computed-properties
          this.$_undefinedHeights++
          // eslint-disable-next-line vue/no-side-effects-in-computed-properties
          this.$_undefinedMap[id] = true
          height = 0
        }
        result.push({
          item,
          id,
          height,
        })
      }
      return result
    },

    listeners () {
      const listeners = {}
      for (const key in this.$listeners) {
        if (key !== 'resize' && key !== 'visible') {
          listeners[key] = this.$listeners[key]
        }
      }
      return listeners
    },
  },

  watch: {
    items () {
      this.forceUpdate(false)
    },
  },

  created () {
    this.$_updates = []
    this.$_undefinedHeights = 0
    this.$_undefinedMap = {}
  },

  mounted () {
    const scroller = this.$refs.scroller
    const rect = this.getSize(scroller)
    this._scrollerWidth = rect.width
  },

  activated () {
    this.vscrollData.active = true
  },

  deactivated () {
    this.vscrollData.active = false
  },

  methods: {
    onScrollerResize () {
      const scroller = this.$refs.scroller
      if (scroller) {
        this.forceUpdate()
      }
      this.$emit('resize')
    },

    onScrollerVisible () {
      this.$emit('vscroll:update', { force: false })
      this.$emit('visible')
    },

    forceUpdate (clear = true) {
      if (clear) this.vscrollData.heights = {}
      this.$emit('vscroll:update', { force: true })
    },

    getSize (scroller) {
      return scroller.$el.getBoundingClientRect()
    },

    scrollToItem (index) {
      const scroller = this.$refs.scroller
      if (scroller) scroller.scrollToItem(index)
    },

    getItemSize (item) {
      const id = item[this.keyField]
      return this.vscrollData.heights[id] || 0
    },

    scrollToBottom () {
      if (this.$_scrollingToBottom) return
      this.$_scrollingToBottom = true
      const el = this.$el
      // Item is inserted to the DOM
      this.$nextTick(() => {
        // Item sizes are computed
        const cb = () => {
          el.scrollTop = el.scrollHeight
          if (this.$_undefinedHeights === 0) {
            this.$_scrollingToBottom = false
          } else {
            requestAnimationFrame(cb)
          }
        }
        requestAnimationFrame(cb)
      })
    },
  },
}
</script>

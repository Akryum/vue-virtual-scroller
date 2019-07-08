<template>
  <RecycleScroller
    ref="scroller"
    :items="itemsWithSize"
    :min-item-size="minItemSize"
    :direction="direction"
    key-field="id"
    v-bind="$attrs"
    @resize="onScrollerResize"
    @visible="onScrollerVisible"
    v-on="listeners"
  >
    <template slot-scope="{ item: itemWithSize, index, active }">
      <slot
        v-bind="{
          item: itemWithSize.item,
          index,
          active,
          itemWithSize
        }"
      />
    </template>
    <template slot="before">
      <slot name="before" />
    </template>
    <template slot="after">
      <slot name="after" />
    </template>
  </RecycleScroller>
</template>

<script>
import RecycleScroller from './RecycleScroller.vue'
import { props, simpleArray } from './common'

export default {
  name: 'DynamicScroller',

  components: {
    RecycleScroller,
  },

  inheritAttrs: false,

  provide () {
    return {
      vscrollData: this.vscrollData,
      vscrollParent: this,
    }
  },

  props: {
    ...props,

    minItemSize: {
      type: [Number, String],
      required: true,
    },
  },

  data () {
    return {
      vscrollData: {
        active: true,
        sizes: {},
        validSizes: {},
        keyField: this.keyField,
        simpleArray: false,
      },
    }
  },

  computed: {
    simpleArray,

    itemsWithSize () {
      const result = []
      const { items, keyField, simpleArray } = this
      const sizes = this.vscrollData.sizes
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        const id = simpleArray ? i : item[keyField]
        let size = sizes[id]
        if (typeof size === 'undefined' && !this.$_undefinedMap[id]) {
          // eslint-disable-next-line vue/no-side-effects-in-computed-properties
          this.$_undefinedSizes++
          // eslint-disable-next-line vue/no-side-effects-in-computed-properties
          this.$_undefinedMap[id] = true
          size = 0
        }
        result.push({
          item,
          id,
          size,
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

    simpleArray: {
      handler (value) {
        this.vscrollData.simpleArray = value
      },
      immediate: true,
    },

    direction (value) {
      this.forceUpdate(true)
    },

    itemsWithSize (next, prev) {
      const scrollTop = this.$el.scrollTop

      // Calculate total diff between prev and next sizes
      // over current scroll top. Then add it to scrollTop to
      // avoid jumping the contents that the user is seeing.
      let prevActiveTop = 0; let activeTop = 0
      const length = Math.min(next.length, prev.length)
      for (let i = 0; i < length; i++) {
        if (prevActiveTop >= scrollTop) {
          break
        }
        prevActiveTop += prev[i].size || this.minItemSize
        activeTop += next[i].size || this.minItemSize
      }
      const offset = activeTop - prevActiveTop

      if (offset === 0) {
        return
      }

      this.$el.scrollTop = this.$el.scrollTop + offset
    },
  },

  created () {
    this.$_updates = []
    this.$_undefinedSizes = 0
    this.$_undefinedMap = {}
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
      if (clear || this.simpleArray) {
        this.vscrollData.validSizes = {}
      }
      this.$emit('vscroll:update', { force: true })
    },

    scrollToItem (index) {
      const scroller = this.$refs.scroller
      if (scroller) scroller.scrollToItem(index)
    },

    getItemSize (item, index = undefined) {
      const id = this.simpleArray ? (index != null ? index : this.items.indexOf(item)) : item[this.keyField]
      return this.vscrollData.sizes[id] || 0
    },

    scrollToBottom () {
      if (this.$_scrollingToBottom) return
      this.$_scrollingToBottom = true
      const el = this.$el
      // Item is inserted to the DOM
      this.$nextTick(() => {
        // Item sizes are computed
        const cb = () => {
          const prevTop = el.scrollTop
          el.scrollTop = el.scrollHeight

          // If scroll top is not changed, that means the scroll position is
          // already bottom and stable. We stop the process of scrolling to bottom here.
          if (prevTop === el.scrollTop) {
            this.$_scrollingToBottom = false
          } else {
            // Wait for RecycleScroller's visible items calculation
            requestAnimationFrame(() => {
              // Wait for DOM update
              requestAnimationFrame(cb)
            })
          }
        }
        requestAnimationFrame(cb)
      })
    },
  },
}
</script>

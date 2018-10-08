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
        result.push({
          item,
          id,
          height: heights[id] || 0,
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
    items: 'forceUpdate',
  },

  created () {
    this.$_updates = []
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

    forceUpdate () {
      this.vscrollData.heights = {}
      this.$emit('vscroll:update', { force: true })
    },

    getSize (scroller) {
      return scroller.$el.getBoundingClientRect()
    },

    scrollToItem (index) {
      const scroller = this.$refs.scroller
      if (scroller) scroller.scrollToItem(index)
    },
  },
}
</script>

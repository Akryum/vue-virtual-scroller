<template>
  <div class="virtual-scroller" @scroll="updateVisibleItems">
    <div class="item-container" :style="itemContainerStyle">
      <div class="items">
        <component class="item" v-for="item in visibleItems" :key="item[keyField]" :is="renderers[item[typeField]]" :item="item"></component>
      </div>
    </div>

    <resize-observer @notify="updateVisibleItems" />
  </div>
</template>

<script>
import { ResizeObserver } from 'vue-resize'

export default {
  name: 'virtual-scroller',

  components: {
    ResizeObserver,
  },

  props: {
    items: {
      type: Array,
      required: true,
    },
    renderers: {
      required: true,
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
  },

  data: () => ({
    visibleItems: [],
    itemContainerStyle: null,
  }),

  watch: {
    items () {
      this.updateVisibleItems()
    },
  },

  methods: {
    updateVisibleItems () {
      const l = this.items.length
      const el = this.$el
      const scroll = {
        top: el.scrollTop,
        bottom: el.scrollTop + el.clientHeight,
      }
      this._startIndex = Math.floor(scroll.top / this.itemHeight)
      this._endIndex = Math.ceil(scroll.bottom / this.itemHeight)
      let startIndex = this._startIndex - 1
      if (startIndex < 0) {
        startIndex = 0
      }
      let endIndex = this._endIndex + 2
      if (endIndex > l) {
        endIndex = l
      }
      this.visibleItems = this.items.slice(startIndex, endIndex)
      this.itemContainerStyle = {
        height: l * this.itemHeight + 'px',
        paddingTop: startIndex * this.itemHeight + 'px',
      }
      this.$forceUpdate()
    },

    scrollToItem (index) {
      this.$el.scrollTop = index * this.itemHeight
    },
  },

  mounted () {
    this.updateVisibleItems()
  },
}
</script>

<style scoped>
.virtual-scroller {
  overflow-y: auto;
}

.item-container {
  box-sizing: border-box;
}
</style>

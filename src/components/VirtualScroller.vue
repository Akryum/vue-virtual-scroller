<template>
  <component :is="mainTag" class="virtual-scroller" @scroll="updateVisibleItems" v-observe-visibility="handleVisibilityChange">
    <component :is="containerTag" class="item-container" :style="itemContainerStyle">
      <component :is="contentTag" class="items" :style="itemsStyle">
        <template v-if="renderers">
          <component class="item" v-for="item in visibleItems" :key="item[keyField]" :is="renderers[item[typeField]]" :item="item"></component>
        </template>
        <template v-else>
          <slot class="item" v-for="item in visibleItems" :item="item"></slot>
        </template>
      </component>
    </component>
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
    contentTag: {
      type: String,
      default: 'div',
    },
  },

  data: () => ({
    visibleItems: [],
    itemContainerStyle: null,
    itemsStyle: null,
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
      }
      this.itemsStyle = {
        marginTop: startIndex * this.itemHeight + 'px',
      }
      this.$forceUpdate()
    },

    scrollToItem (index) {
      this.$el.scrollTop = index * this.itemHeight
    },

    handleVisibilityChange (isVisible) {
      if (isVisible) {
        this.updateVisibleItems()
      }
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
  width: 100%;
  overflow: hidden;
}

.items {
  width: 100%;
}
</style>

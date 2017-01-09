<template>
  <component :is="mainTag" class="virtual-scroller" :class="cssClass" @scroll="updateVisibleItems" v-observe-visibility="handleVisibilityChange">
    <component :is="containerTag" class="item-container" :style="itemContainerStyle">
      <component :is="contentTag" class="items" :style="itemsStyle">
        <template v-if="renderers">
          <component class="item" v-for="item in visibleItems" :key="keysEnabled && item[keyField]" :is="renderers[item[typeField]]" :item="item"></component>
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
    pageMode: {
      type: Boolean,
      default: false,
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
        let startIndex = Math.floor(scroll.top / this.itemHeight)
        let endIndex = Math.ceil(scroll.bottom / this.itemHeight)
        startIndex -= 1
        if (startIndex < 0) {
          startIndex = 0
        }
        endIndex += 2
        if (endIndex > l) {
          endIndex = l
        }
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
        this.$forceUpdate()
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

<script>
export default {
  name: 'DynamicScrollerItem',

  inject: [
    'vscrollData',
    'vscrollParent',
    'vscrollResizeObserver',
  ],

  props: {
    // eslint-disable-next-line vue/require-prop-types
    item: {
      required: true,
    },

    watchData: {
      type: Boolean,
      default: false,
    },

    /**
     * Indicates if the view is actively used to display an item.
     */
    active: {
      type: Boolean,
      required: true,
    },

    index: {
      type: Number,
      default: undefined,
    },

    sizeDependencies: {
      type: [Array, Object],
      default: null,
    },

    emitResize: {
      type: Boolean,
      default: false,
    },

    tag: {
      type: String,
      default: 'div',
    },
  },

  computed: {
    id () {
      if (this.vscrollData.simpleArray) return this.index
      // eslint-disable-next-line no-prototype-builtins
      if (this.item.hasOwnProperty(this.vscrollData.keyField)) return this.item[this.vscrollData.keyField]
      throw new Error(`keyField '${this.vscrollData.keyField}' not found in your item. You should set a valid keyField prop on your Scroller`)
    },

    size () {
      return (this.vscrollData.validSizes[this.id] && this.vscrollData.sizes[this.id]) || 0
    },

    finalActive () {
      return this.active && this.vscrollData.active
    },
  },

  watch: {
    watchData: 'updateWatchData',

    id () {
      if (!this.size) {
        this.onDataUpdate()
      }
    },

    finalActive (value) {
      if (!this.size) {
        if (value) {
          if (!this.vscrollParent.$_undefinedMap[this.id]) {
            this.vscrollParent.$_undefinedSizes++
            this.vscrollParent.$_undefinedMap[this.id] = true
          }
        } else {
          if (this.vscrollParent.$_undefinedMap[this.id]) {
            this.vscrollParent.$_undefinedSizes--
            this.vscrollParent.$_undefinedMap[this.id] = false
          }
        }
      }

      if (this.vscrollResizeObserver) {
        if (value) {
          this.observeSize()
        } else {
          this.unobserveSize()
        }
      } else if (value && this.$_pendingVScrollUpdate === this.id) {
        this.updateSize()
      }
    },
  },

  created () {
    if (this.$isServer) return

    this.$_forceNextVScrollUpdate = null
    this.updateWatchData()

    if (!this.vscrollResizeObserver) {
      for (const k in this.sizeDependencies) {
        this.$watch(() => this.sizeDependencies[k], this.onDataUpdate)
      }

      this.vscrollParent.$on('vscroll:update', this.onVscrollUpdate)
      this.vscrollParent.$on('vscroll:update-size', this.onVscrollUpdateSize)
    }
  },

  mounted () {
    if (this.vscrollData.active) {
      this.updateSize()
      this.observeSize()
    }
  },

  beforeDestroy () {
    this.vscrollParent.$off('vscroll:update', this.onVscrollUpdate)
    this.vscrollParent.$off('vscroll:update-size', this.onVscrollUpdateSize)
    this.unobserveSize()
  },

  methods: {
    updateSize () {
      if (this.finalActive) {
        if (this.$_pendingSizeUpdate !== this.id) {
          this.$_pendingSizeUpdate = this.id
          this.$_forceNextVScrollUpdate = null
          this.$_pendingVScrollUpdate = null
          this.computeSize(this.id)
        }
      } else {
        this.$_forceNextVScrollUpdate = this.id
      }
    },

    updateWatchData () {
      if (this.watchData && !this.vscrollResizeObserver) {
        this.$_watchData = this.$watch('item', () => {
          this.onDataUpdate()
        }, {
          deep: true,
        })
      } else if (this.$_watchData) {
        this.$_watchData()
        this.$_watchData = null
      }
    },

    onVscrollUpdate ({ force }) {
      // If not active, sechedule a size update when it becomes active
      if (!this.finalActive && force) {
        this.$_pendingVScrollUpdate = this.id
      }

      if (this.$_forceNextVScrollUpdate === this.id || force || !this.size) {
        this.updateSize()
      }
    },

    onDataUpdate () {
      this.updateSize()
    },

    computeSize (id) {
      this.$nextTick(() => {
        if (this.id === id) {
          const width = this.$el.offsetWidth
          const height = this.$el.offsetHeight
          this.applySize(width, height)
        }
        this.$_pendingSizeUpdate = null
      })
    },

    applySize (width, height) {
      const size = ~~(this.vscrollParent.direction === 'vertical' ? height : width)
      if (size && this.size !== size) {
        if (this.vscrollParent.$_undefinedMap[this.id]) {
          this.vscrollParent.$_undefinedSizes--
          this.vscrollParent.$_undefinedMap[this.id] = undefined
        }
        this.$set(this.vscrollData.sizes, this.id, size)
        this.$set(this.vscrollData.validSizes, this.id, true)
        if (this.emitResize) this.$emit('resize', this.id)
      }
    },

    observeSize () {
      if (!this.vscrollResizeObserver || !this.$el.parentNode) return
      this.vscrollResizeObserver.observe(this.$el.parentNode)
      this.$el.parentNode.addEventListener('resize', this.onResize)
    },

    unobserveSize () {
      if (!this.vscrollResizeObserver) return
      this.vscrollResizeObserver.unobserve(this.$el.parentNode)
      this.$el.parentNode.removeEventListener('resize', this.onResize)
    },

    onResize (event) {
      const { width, height } = event.detail.contentRect
      this.applySize(width, height)
    },
  },

  render (h) {
    return h(this.tag, this.$slots.default)
  },
}
</script>

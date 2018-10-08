<script>
export default {
  name: 'DynamicScrollerItem',

  inject: [
    'vscrollData',
    'vscrollBus',
  ],

  props: {
    item: {
      type: Object,
      required: true,
    },

    watchData: {
      type: Boolean,
      default: false,
    },

    active: {
      type: Boolean,
      required: true,
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
      return this.item[this.vscrollData.keyField]
    },

    height () {
      return this.vscrollData.heights[this.id] || 0
    },
  },

  watch: {
    watchData: 'updateWatchData',

    id () {
      if (!this.height) {
        this.onDataUpdate()
      }
    },

    active (value) {
      if (value && this.$_pendingVScrollUpdate) {
        this.updateSize()
      }
    },
  },

  created () {
    if (this.$isServer) return

    this.$_forceNextVScrollUpdate = false
    this.updateWatchData()

    for (const k in this.sizeDependencies) {
      this.$watch(() => this.sizeDependencies[k], this.onDataUpdate)
    }

    this.vscrollBus.$on('vscroll:update', this.onVscrollUpdate)
    this.vscrollBus.$on('vscroll:update-size', this.onVscrollUpdateSize)
  },

  mounted () {
    if (this.vscrollData.active) {
      this.updateSize()
    }
  },

  beforeDestroy () {
    this.vscrollBus.$off('vscroll:update', this.onVscrollUpdate)
    this.vscrollBus.$off('vscroll:update-size', this.onVscrollUpdateSize)
  },

  methods: {
    updateSize () {
      if (this.active && this.vscrollData.active) {
        if (!this.$_pendingSizeUpdate) {
          this.$_pendingSizeUpdate = true
          this.$_forceNextVScrollUpdate = false
          this.$_pendingVScrollUpdate = false
          if (this.active && this.vscrollData.active) {
            this.computeSize(this.id)
          }
        }
      } else {
        this.$_forceNextVScrollUpdate = true
      }
    },

    getSize () {
      return this.$el.getBoundingClientRect()
    },

    updateWatchData () {
      if (this.watchData) {
        this.$_watchData = this.$watch('data', () => {
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
      if (!this.active && force) {
        this.$_pendingVScrollUpdate = true
      }
      if (this.$_forceNextVScrollUpdate || force || !this.height) {
        this.updateSize()
      }
    },

    onDataUpdate () {
      this.updateSize()
    },

    computeSize (id) {
      this.$nextTick(() => {
        if (this.id === id) {
          const size = this.getSize()
          if (size.height && this.height !== size.height) {
            this.$set(this.vscrollData.heights, this.id, size.height)
            if (this.emitResize) this.$emit('resize', this.id)
          }
        }
        this.$_pendingSizeUpdate = false
      })
    },
  },

  render (h) {
    return h(this.tag, this.$slots.default)
  },
}
</script>

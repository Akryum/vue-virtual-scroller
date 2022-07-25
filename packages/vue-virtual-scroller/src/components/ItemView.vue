<template>
  <component
    :is="itemTag"
    class="vue-recycle-scroller__item-view"
    :class="{ hover }"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
  >
    <slot
      :item="view.item"
      :index="view.nr.index"
      :active="view.nr.used"
    />
  </component>
</template>

<script>
export default {
  props: {
    view: Object,
    itemTag: String,
  },
  data () {
    return {
      hover: false,
    }
  },
}
</script>

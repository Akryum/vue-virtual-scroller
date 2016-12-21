import _VirtualScroller from './components/VirtualScroller.vue'

export function install (Vue) {
  Vue.component('virtual-scroller', _VirtualScroller)
}

export const VirtualScroller = _VirtualScroller

export default {
  /* eslint-disable no-undef */
  version: VERSION,
  install,
}

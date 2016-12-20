import _VirtualScroller from './components/VirtualScroller.vue'

export function install (Vue) {
  Vue.component('test', _VirtualScroller)
}

export const VirtualScroller = _VirtualScroller

export default {
  /* eslint-disable no-undef */
  version: VERSION,
  install,
}

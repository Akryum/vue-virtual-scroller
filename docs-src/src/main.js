import Vue from 'vue'
import VirtualScroller, { VirtualScroller as Comp } from '../../'

console.log(VirtualScroller, Comp)

Vue.use(VirtualScroller)

import App from './App.vue'

/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App),
})

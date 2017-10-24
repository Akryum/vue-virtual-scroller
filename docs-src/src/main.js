import Vue from 'vue'
import VirtualScroller, { VirtualScroller as Comp } from '../../'
import '../../dist/vue-virtual-scroller.css'
import App from './App.vue'

console.log(VirtualScroller, Comp)

Vue.use(VirtualScroller)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App),
})

import Vue from 'vue'
// vue-virtual-scroller
import VirtualScroller, { RecycleScroller as Comp } from '../../'
import '../../dist/vue-virtual-scroller.css'
// App
import router from './router'
import App from './App.vue'

console.log(VirtualScroller, Comp)

Vue.use(VirtualScroller)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  render: h => h(App),
})

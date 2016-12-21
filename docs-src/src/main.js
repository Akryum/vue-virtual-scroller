import Vue from 'vue'
import VirtualScroller from '../../'

Vue.use(VirtualScroller)

import App from './App.vue'

/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App),
})

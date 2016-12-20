import Vue from 'vue'
// import VirtualScroller from '../src/VirtualScroller.vue'
import { VirtualScroller } from '../../template-test'
import * as Index from '../'

console.log(Index)
console.log(VirtualScroller)

Vue.component('virtual-scroller', VirtualScroller)

import Demo from './Demo.vue'

const app = new Vue({
  render: h => h(Demo),
})
app.$mount('#app')

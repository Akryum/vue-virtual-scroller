import Vue from 'vue'
import VueRouter from 'vue-router'

import Home from './components/Home.vue'
import Recycle from './components/RecycleScrollerDemo.vue'
import Dynamic from './components/DynamicScrollerDemo.vue'
import TestChat from './components/TestChat.vue'
import SimpleList from './components/SimpleList.vue'
import HorizontalDemo from './components/HorizontalDemo.vue'

Vue.use(VueRouter)

export default new VueRouter({
  routes: [
    { path: '/', name: 'home', component: Home },
    { path: '/recycle', name: 'recycle', component: Recycle },
    { path: '/dynamic', name: 'dynamic', component: Dynamic },
    { path: '/test-chat', name: 'test-chat', component: TestChat },
    { path: '/simple-list', name: 'simple-list', component: SimpleList },
    { path: '/horizontal', name: 'horizontal', component: HorizontalDemo },
  ],
})

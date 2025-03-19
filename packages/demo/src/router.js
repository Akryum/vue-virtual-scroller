import { createRouter, createWebHistory } from 'vue-router'

import ChatDemo from './components/ChatDemo.vue'
import Dynamic from './components/DynamicScrollerDemo.vue'
import GridDemo from './components/GridDemo.vue'
import Home from './components/Home.vue'
import HorizontalDemo from './components/HorizontalDemo.vue'
import Recycle from './components/RecycleScrollerDemo.vue'
import SimpleList from './components/SimpleList.vue'
import TestChat from './components/TestChat.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: Home },
    { path: '/recycle', name: 'recycle', component: Recycle },
    { path: '/dynamic', name: 'dynamic', component: Dynamic },
    { path: '/test-chat', name: 'test-chat', component: TestChat },
    { path: '/simple-list', name: 'simple-list', component: SimpleList },
    { path: '/horizontal', name: 'horizontal', component: HorizontalDemo },
    { path: '/chat', name: 'chat', component: ChatDemo },
    { path: '/grid', name: 'grid', component: GridDemo },
  ],
})

export default router

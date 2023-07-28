import { createRouter, createWebHistory } from 'vue-router'

import Home from './components/Home.vue'
import Recycle from './components/RecycleScrollerDemo.vue'
import Dynamic from './components/DynamicScrollerDemo.vue'
import TestChat from './components/TestChat.vue'
import SimpleList from './components/SimpleList.vue'
import HorizontalDemo from './components/HorizontalDemo.vue'
import ChatDemo from './components/ChatDemo.vue'
import GridDemo from './components/GridDemo.vue'

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

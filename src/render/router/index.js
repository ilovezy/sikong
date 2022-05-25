import Vue from 'vue'
import VueRouter from 'vue-router'
import Layout from "layout"

Vue.use(VueRouter)

const routes = [

  {
    path: '/home',
    name: 'home',
    component: Layout,
    redirect: '/home/chat',
    children: [
      {
        path: 'chat',
        name: 'chat',
        component: () => import(/* webpackChunkName: "about" */ 'views/chat/index.vue')
      },
      {
        path: 'email',
        name: 'email',
        component: () => import(/* webpackChunkName: "about" */ 'views/email/index.vue')
      },
      {
        path: 'box',
        name: 'box',
        component: () => import(/* webpackChunkName: "about" */ 'views/box/index.vue')
      },
      {
        path: 'contact',
        name: 'contact',
        component: () => import(/* webpackChunkName: "about" */ 'views/contact/index.vue')
      },
      {
        path: 'setting',
        name: 'setting',
        component: () => import(/* webpackChunkName: "about" */ 'views/setting/index.vue')
      }
    ]
  },
  {
    path: '/help',
    name: 'help',
    component: () => import(/* webpackChunkName: "about" */ 'views/help/index.vue')
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('views/login/index.vue')
  },
]

const router = new VueRouter({
  routes
})

export default router

import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/dashboard' },
  { path: '/dashboard', name: 'Dashboard', component: () => import('../views/Dashboard.vue') },
  { path: '/transactions', name: 'Transactions', component: () => import('../views/Transactions.vue') },
  { path: '/categories', name: 'Categories', component: () => import('../views/Categories.vue') },
  { path: '/members', name: 'Members', component: () => import('../views/Members.vue') },
  { path: '/assets', name: 'Assets', component: () => import('../views/Assets.vue') },
  { path: '/analysis', name: 'Analysis', component: () => import('../views/Analysis.vue') },
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
})



import { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    alias: '/blog',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/Index.vue') }]
  },
  {
    path: '/settings',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/Settings.vue') }]
  },
  {
    path: '/login',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/Login.vue') }]
  },
  {
    path: '/user',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', component: () => import('pages/user/Index.vue') },
      { path: 'family', component: () => import('pages/user/Family.vue') },
      { path: 'payment', component: () => import('pages/user/Payment.vue') }
    ]
  },
  {
    path: '/service',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: ':id/:slug?', component: () => import('pages/service/_id/_slug.vue') }
    ]
  },
  {
    path: '/blog/:id/:slug?',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/blog/_id/_slug.vue') }]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes

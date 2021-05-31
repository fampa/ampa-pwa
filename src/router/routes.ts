import { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    alias: '/blog',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/Index.vue') }]
  },
  {
    path: '/:type/:id/:slug?',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/_type/_id/_slug.vue') }]
  },
  {
    path: '/settings',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/Settings.vue') }]
  },
  {
    path: '/contact',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/Contact.vue') }]
  },
  {
    path: '/privacy',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('src/pages/Privacy/Index.vue') }]
  },
  {
    path: '/terms',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('src/pages/Terms/Index.vue') }]
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
      { path: 'payment', component: () => import('pages/user/Payment.vue') },
      { path: 'message/:id', component: () => import('pages/user/message/_id.vue') }
    ]
  },
  {
    path: '/admin',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresScope: 'admin' },
    children: [
      { path: 'users', component: () => import('pages/admin/Users.vue') },
      { path: 'users/edit/:id', component: () => import('pages/user/Index.vue') },
      { path: 'family/edit/:id', component: () => import('pages/user/Family.vue') },
      { path: 'payment/edit/:id', component: () => import('pages/user/Payment.vue') },
      { path: ':type/edit/:id?', component: () => import('src/pages/admin/_type/Edit.vue') },
      { path: ':type', component: () => import('src/pages/admin/_type/Index.vue') }

    ]
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes

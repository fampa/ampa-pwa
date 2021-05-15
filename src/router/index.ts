import { route } from 'quasar/wrappers'
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory
} from 'vue-router'
import { StateInterface } from '../store'
import routes from './routes'
import firebase from 'firebase/app'
import 'firebase/auth'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route<StateInterface>(function (/* { store } */) {
  const createHistory =
    process.env.SERVER
      ? createMemoryHistory
      : process.env.VUE_ROUTER_MODE === 'history'
        ? createWebHistory
        : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: (to, from, savedPosition) => {
      if (savedPosition) {
        return savedPosition
      } else {
        return { left: 0, top: 0 }
      }
    },
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(
      process.env.MODE === 'ssr' ? void 0 : process.env.VUE_ROUTER_BASE
    )
  })

  // eslint-disable-next-line @typescript-eslint/require-await
  Router.beforeEach((to, from, next) => {
    firebase.auth().onAuthStateChanged(async function (user) {
      const requireScope = to.matched.some(record => record.meta.requiresScope)
      const requireAuth = to.matched.some(record => record.meta.requiresAuth)
      if (requireAuth || requireScope) {
        if (!user) { // there is no user
          return next({ path: '/login', query: { next: to.fullPath } })
        // } else if (!user.emailVerified && to.path !== '/verifyEmail' && to.path !== '/completeAccount') {
        //   return next('/verifyEmail')
        } else { // there is user. Let's check permissions
          if (requireScope) {
            const permissionRequired = to.matched.find(record => record.meta.requiresScope)?.meta.requiresScope as string
            // console.log('scope required', permissionRequired)

            const tokenResult = await user.getIdTokenResult(true)
            // console.log('tokenResult', tokenResult)
            const hasuraClaim = tokenResult?.claims ? tokenResult.claims['https://hasura.io/jwt/claims'] as Record<string, unknown> : null
            const permissionsGranted = hasuraClaim ? hasuraClaim['x-hasura-default-role'] as string : null
            const hasPermission = permissionsGranted && permissionsGranted.includes(permissionRequired)
            if (hasPermission) {
              return next()
            } else {
              return next({
                path: '/'
              })
            }
          } else {
            return next() // requiresAuth passed
          }
        }
      } else {
        return next() // make sure to always call next()!
      }
    })
  })

  return Router
})

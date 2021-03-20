import { store } from 'quasar/wrappers'
import { createStore } from 'vuex'

import settings from './settings'
import { SettingsStateInterface } from './settings/state'

import user from './user'
import { UserStateInterface } from './user/state'

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */

export interface StateInterface {
  settings: SettingsStateInterface
  user: UserStateInterface
}

export default store(function (/* { ssrContext } */) {
  const Store = createStore<StateInterface>({
    modules: {
      settings,
      user
    },

    // enable strict mode (adds overhead!)
    // for dev mode and --debug builds only
    strict: !!process.env.DEBUGGING
  })

  return Store
})

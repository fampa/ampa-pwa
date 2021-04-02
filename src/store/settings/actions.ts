import { ActionTree } from 'vuex'
import { StateInterface } from '../index'
import { SettingsStateInterface } from './state'
import { i18n } from 'src/boot/i18n'
import { Quasar } from 'quasar'

const actions: ActionTree<SettingsStateInterface, StateInterface> = {
  async setLanguage ({ commit }, payload: string) {
    i18n.global.locale = payload
    const langIso = payload // ... some logic to determine it (use Cookies Plugin?)

    try {
      await import(
      /* webpackInclude: /(es|ca)\.js$/ */
        'quasar/lang/' + langIso
      )
        .then(lang => {
          // console.log('lang', lang)
          Quasar.lang.set(lang.default)
        })
    } catch (err) {
    // Requested Quasar Language Pack does not exist,
    // let's not break the app, so catching error
    }
    commit('setLanguage', payload)
  }
}

export default actions

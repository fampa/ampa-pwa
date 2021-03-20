import { ActionTree } from 'vuex'
import { StateInterface } from '../index'
import { SettingsStateInterface } from './state'
import { i18n } from 'src/boot/i18n'

const actions: ActionTree<SettingsStateInterface, StateInterface> = {
  setLanguage ({ commit }, payload: string) {
    i18n.global.locale = payload

    commit('setLanguage', payload)
  }
}

export default actions

import { ActionTree } from 'vuex'
import { StateInterface } from '../index'
import { SettingsStateInterface } from './state'
// import { i18n } from 'src/boot/i18n'
import { useI18n } from 'vue-i18n'

const actions: ActionTree<SettingsStateInterface, StateInterface> = {
  changeLanguage ({ commit }, payload: string) {
    // i18n.global.locale = payload
    const { locale } = useI18n({ useScope: 'global' })
    locale.value = payload
    commit('setLanguage', payload)
  }
}

export default actions

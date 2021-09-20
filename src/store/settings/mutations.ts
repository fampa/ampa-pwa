import { MutationTree } from 'vuex'
import { SettingsStateInterface } from './state'

const mutation: MutationTree<SettingsStateInterface> = {
  setLanguage (state: SettingsStateInterface, payload: string) {
    state.language = payload
  },
  setPresentedChoice (state: SettingsStateInterface) {
    state.presentedChoice = true
  }
}

export default mutation

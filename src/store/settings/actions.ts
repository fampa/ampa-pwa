import { ActionTree } from 'vuex'
import { StateInterface } from '../index'
import { SettingsStateInterface } from './state'

const actions: ActionTree<SettingsStateInterface, StateInterface> = {
  someAction (/* context */) {
    // your code
  }
}

export default actions

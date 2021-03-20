import { Member } from '@/models/Member'
import { ActionTree } from 'vuex'
import { StateInterface } from '../index'
import { UserStateInterface } from './state'

const actions: ActionTree<UserStateInterface, StateInterface> = {
  setUser ({ commit }, payload: Member) {
    commit('setUser', payload)
  }
}

export default actions

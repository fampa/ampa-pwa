import { Member } from '@/models/Member'
import { ActionTree } from 'vuex'
import { StateInterface } from '../index'
import { UserStateInterface } from './state'
import firebase from 'firebase/app'

const actions: ActionTree<UserStateInterface, StateInterface> = {
  setUser ({ commit }, payload: Member) {
    commit('setUser', payload)
  },

  async logout ({ commit }) {
    await firebase.auth().signOut()
    commit('setUser', null)
  }
}

export default actions

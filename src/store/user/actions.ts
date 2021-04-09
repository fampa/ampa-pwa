import { Member } from '@/models/Member'
import { ActionTree } from 'vuex'
import { StateInterface } from '../index'
import { UserStateInterface } from './state'
import firebase from 'firebase/app'
import { apolloClient } from 'src/boot/apollo'

const actions: ActionTree<UserStateInterface, StateInterface> = {
  setUser ({ commit }, payload: Member) {
    commit('setUser', payload)
  },

  async logout ({ commit }) {
    await firebase.auth().signOut()
    await apolloClient.resetStore()
    commit('setUser', null)
  }
}

export default actions

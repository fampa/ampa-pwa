import { Member } from 'src/models/Member'
import { ActionTree } from 'vuex'
import { StateInterface } from '../index'
import { UserStateInterface } from './state'
import firebase from 'firebase/app'
import 'firebase/auth'
import { ContentsService } from 'src/services/contents'

const actions: ActionTree<UserStateInterface, StateInterface> = {
  setUser ({ commit }, payload: firebase.User) {
    commit('setUser', payload)
  },

  setMember ({ commit }, payload: Member) {
    commit('setMember', payload)
  },

  async logout ({ commit }) {
    const contentsService = new ContentsService()
    await firebase.auth().signOut()
    await contentsService.clearCache()
    commit('setUser', null)
    // window.location.reload()
  }
}

export default actions

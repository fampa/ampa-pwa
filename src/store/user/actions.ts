import { Member } from 'src/models/Member'
import { ActionTree } from 'vuex'
import { StateInterface } from '../index'
import { UserStateInterface } from './state'
import firebase from 'firebase/app'
import 'firebase/auth'
import { ArticlesService } from 'src/services/articles'

const actions: ActionTree<UserStateInterface, StateInterface> = {
  setUser ({ commit }, payload: firebase.User) {
    commit('setUser', payload)
  },

  setMember ({ commit }, payload: Member) {
    commit('setMember', payload)
  },

  async logout ({ commit }) {
    const articlesService = new ArticlesService()
    await firebase.auth().signOut()
    await articlesService.clearCache()
    commit('setUser', null)
    window.location.reload()
  }
}

export default actions

import { Member } from '@/models/Member'
import { ActionTree } from 'vuex'
import { StateInterface } from '../index'
import { UserStateInterface } from './state'
import firebase from 'firebase/app'
import { ArticlesService } from 'src/services/articles'

const actions: ActionTree<UserStateInterface, StateInterface> = {
  setUser ({ commit }, payload: Member) {
    commit('setUser', payload)
  },

  async logout ({ commit }) {
    const articlesService = new ArticlesService()
    await firebase.auth().signOut()
    await articlesService.clearCache()
    commit('setUser', null)
  }
}

export default actions

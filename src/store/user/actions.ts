import { MemberData } from 'src/models/Member'
import { ActionTree } from 'vuex'
import { StateInterface } from '../index'
import { UserStateInterface } from './state'
import firebase from 'firebase/app'
import 'firebase/auth'
import { ContentsService } from 'src/services/contents'
import { apolloClients } from 'src/extensions/apollo/boot'
import getMemberById from 'src/services/members/queries/getMemberById.gql'

const actions: ActionTree<UserStateInterface, StateInterface> = {
  setUser ({ commit }, payload: firebase.User) {
    commit('setUser', payload)
  },

  async setMember ({ commit }, id: string) {
    await apolloClients?.default?.query<MemberData>({ query: getMemberById, variables: { id }, fetchPolicy: 'network-only' })
      .then((res) => {
        const member = res?.data?.members_by_pk
        commit('setMember', member)
      })
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

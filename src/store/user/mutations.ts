import { Member } from '@/models/Member'
import firebase from 'firebase/app'
import 'firebase/auth'
import { MutationTree } from 'vuex'
import { UserStateInterface } from './state'

const mutation: MutationTree<UserStateInterface> = {
  setUser (state: UserStateInterface, payload: firebase.User) {
    state.user = payload
  },
  setMember (state: UserStateInterface, payload: Member) {
    state.member = payload
  },
  setAdmin (state: UserStateInterface, payload: boolean) {
    state.isAdmin = payload
  }
}

export default mutation

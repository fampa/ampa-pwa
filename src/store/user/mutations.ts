import firebase from 'firebase/app'
import 'firebase/auth'
import { MutationTree } from 'vuex'
import { UserStateInterface } from './state'

const mutation: MutationTree<UserStateInterface> = {
  setUser (state: UserStateInterface, payload: firebase.UserInfo) {
    state.user = payload
  }
}

export default mutation

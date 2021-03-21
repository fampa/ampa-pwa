import { Member } from '@/models/Member'
import { MutationTree } from 'vuex'
import { UserStateInterface } from './state'

const mutation: MutationTree<UserStateInterface> = {
  setUser (state: UserStateInterface, payload: Member) {
    state.user = payload
  }
}

export default mutation
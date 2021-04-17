import { GetterTree } from 'vuex'
import { StateInterface } from '../index'
import { UserStateInterface } from './state'

const getters: GetterTree<UserStateInterface, StateInterface> = {
  // async isAdmin (/* state */): Promise<boolean> {
  // }
}

export default getters

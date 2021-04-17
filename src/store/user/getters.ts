import { GetterTree } from 'vuex'
import { StateInterface } from '../index'
import { UserStateInterface } from './state'

const getters: GetterTree<UserStateInterface, StateInterface> = {
  async isAdmin ({ user }): Promise<boolean> {
    const tokenResult = await user?.getIdTokenResult(true)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const hasuraClaim = tokenResult?.claims ? tokenResult.claims['https://hasura.io/jwt/claims'] : null
    const isAdmin = hasuraClaim ? hasuraClaim['x-hasura-default-role'] === 'admin' : false
    return isAdmin
  }
}

export default getters

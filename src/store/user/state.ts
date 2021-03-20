import { Member } from '@/models/Member'

export interface UserStateInterface {
  user: Member | null
}

function state (): UserStateInterface {
  return {
    user: null
  }
}

export default state

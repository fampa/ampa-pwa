import { Member } from '@/models/Member'
import firebase from 'firebase/app'
import 'firebase/auth'

export interface UserStateInterface {
  member: Member | null
  user: firebase.User | null
  isAdmin: boolean
}

function state (): UserStateInterface {
  return {
    member: null,
    user: null,
    isAdmin: false
  }
}

export default state

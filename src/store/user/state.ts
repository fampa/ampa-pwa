import { Member } from '@/models/Member'
import firebase from 'firebase/app'
import 'firebase/auth'

export interface UserStateInterface {
  member: Member | null
  user: firebase.User | null
}

function state (): UserStateInterface {
  return {
    member: null,
    user: null
  }
}

export default state

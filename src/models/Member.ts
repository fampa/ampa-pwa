import { Family } from './Family'

/* eslint-disable camelcase */
export interface Member {
  id?: string
  firstName?: string
  lastName?: string
  email?: string
  familyId?: number
  family?: Family
  nif?: string
  photoURL?: string
  isAdmin?: boolean
  phone?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface MembersData {
  members: Member[]
}

export interface MembersVars {
  offset: number
  limit: number
}

export interface MemberVars {
  id?: string
  member?: Member
}

export interface MemberData {
  members_by_pk: Member
}

import { Family } from './Family'

/* eslint-disable camelcase */
export interface Member {
  id?: string
  firstName: string
  lastName: string
  email: string
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
  id: string
}

export interface MemberData {
  members_by_pk: Member
}

export interface UpdateMemberData {
  update_members_by_pk: Member
}

export interface UpdateMemberVars {
  id: string
  firstName?: string
  lastName?: string
  nif?: string
  email?: string
  phone?: string

}

import { Content } from './Content'
/* eslint-disable camelcase */
export interface HiredService {
  service: Content
}

export interface Child {
  id?: number
  firstName: string
  lastName: string
  birthDate: string
  familyId?: number
  hiredServices?: HiredService[]
  createdAt?: Date
  updatedAt?: Date
}

export interface ChildrenData {
  children: Child[]
}

export interface ChildrenVars {
  id?: string
  children?: Child[]
}

export interface childrenData {
  children_by_pk: Child
}

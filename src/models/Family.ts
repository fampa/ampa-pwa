/* eslint-disable camelcase */
import { Child } from './Child'
import { Member } from './Member'

export interface Family {
  id?: number
  name?: string
  children?: Child[]
  iban?: string
  owner?: Member
  ownerId?: string
  mandateId?: string
  members?: Member[]
  mandateSignatureCode?: string
  signatureDate?: Date | string
  createdAt?: Date | string
  updatedAt?: Date | string
  fees?: number
  manualPayment?: boolean
  observations?: string
  inactive?: boolean
}

export interface FamilyData {
  insert_families_one: Family
}

export interface FamilyVars {
  family: Family
}

export interface FamilyUpdateVars {
  id: number
  family: Family
}

export interface FindFamilyVars {
  name: string
}

export interface FamilySearchData {
  search_families: Family[]
}

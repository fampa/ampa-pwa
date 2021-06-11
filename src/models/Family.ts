/* eslint-disable camelcase */
import { Child } from './Child'

export interface Family {
  id?: number
  name?: string
  children?: Child[]
  iban?: string
  ownerId?: string
  mandateId?: string
  mandateSignatureCode?: string
  signatureDate?: Date | string
  createdAt?: Date | string
  updatedAt?: Date | string
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

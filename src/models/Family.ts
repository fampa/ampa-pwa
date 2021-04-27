/* eslint-disable camelcase */
import { Child } from './Child'

export interface Family {
  id?: number
  name?: string
  children?: Child[]
  createdAt?: Date
  updatedAt?: Date
}

export interface FamilyData {
  insert_families_one: Family
}

export interface FamilyVars {
  family: Family
}

export interface FindFamilyVars {
  name: string
}

export interface FamiliesData {
  families: Family[]
}

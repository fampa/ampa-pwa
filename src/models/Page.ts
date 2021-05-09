/* eslint-disable camelcase */
import { PageTranslation } from './PageTranslation'
import { Aggregate } from './QueryTable'

export interface Page {
  id: number
  status: string
  translations: PageTranslation[]
  image?: string
  icon?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface PagesData {
  pages: Page[]
}

export interface PagesVars {
  offset: number
  limit: number
}

export interface PageVars {
  id: number
}

export interface PageData {
  pages_by_pk: Page
}

export interface GetPagesData {
  pages_aggregate: Aggregate
  pages: Page[]
}

/* eslint-disable camelcase */
import { PageTranslation } from './PageTranslation'
import { Aggregate } from './QueryTable'

export interface Page {
  id?: number
  status: string
  translations?: PageTranslation[]
  image?: string
  icon?: string
  isMenu?: boolean
  createdAt?: Date | string
  updatedAt?: Date | string
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

export interface UpsertPageResponse {
  insert_pages_one: Page,
  insert_pages_translations: {
    retuning: PageTranslation[]
  }
}

export interface DeletePageResponse {
  delete_pages_by_pk: Page
}

export interface InsertPageResponse {
  insert_pages_one: Page
}

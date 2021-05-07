/* eslint-disable camelcase */
import { PageTranslation } from './PageTranslation'

export interface Page {
  id: number
  status: string
  translations: PageTranslation[]
  image?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface PagesData {
  pages: Page[];
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

/* eslint-disable camelcase */
import { Member } from './Member'
import { Translation } from './Translation'

export interface Article {
  id: number
  status: string
  translations: Translation[]
  image?: string
  author?: Member
  createdAt?: Date
  updatedAt?: Date
}

export interface ArticlesData {
  articles: Article[];
}

export interface ArticlesVars {
  offset: number
  limit: number
}

export interface ArticleVars {
  id: number
}

export interface ArticleData {
  articles_by_pk: Article
}

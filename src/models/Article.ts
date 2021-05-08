/* eslint-disable camelcase */
import { Member } from './Member'
import { ArticleTranslation } from './ArticleTranslation'

export interface Article {
  id: number
  status: string
  translations: ArticleTranslation[]
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

export interface GetArticlesOptions {
  offset?: number,
  limit?: number,
  orderBy?: Record<string, unknown>
  filter?: string
}

interface Aggregate {
  aggregate: {
    count: number
  }
}

export interface GetArticlesData {
  articles_aggregate: Aggregate,
  articles: Article[]
}

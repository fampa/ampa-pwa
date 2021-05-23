/* eslint-disable camelcase */
import { Member } from './Member'
import { ArticleTranslation } from './ArticleTranslation'
import { Aggregate } from './QueryTable'

export interface Article {
  id?: number
  status: string
  translations: ArticleTranslation[]
  image?: string
  author?: Member
  authorId?: string
  createdAt?: Date | string
  updatedAt?: Date | string
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

export interface GetArticlesData {
  articles_aggregate: Aggregate,
  articles: Article[]
}

export interface UpsertArticleResponse {
  insert_articles_one: Article,
  insert_articles_translations: {
    retuning: ArticleTranslation[]
  }
}
export interface DeleteArticleResponse {
  delete_articles_by_pk: Article
}

export interface InsertArticleResponse {
  insert_articles_one: Article
}

/* eslint-disable camelcase */
import { Member } from './Member'
import { Translation } from './Translation'

export interface Article {
    id: number
    status: string
    translations: Translation[]
    image?: string
    author?: Member
    created_at?: Date
    updated_at?: Date
}

export interface ArticlesData {
    articles: Article[];
}

export interface ArticleVars {
    id: number;
}

export interface ArticleData {
    articles_by_pk: Article
}

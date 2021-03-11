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

export interface ArticleData {
    articles: Article[];
}

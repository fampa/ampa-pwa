/* eslint-disable camelcase */
import { Member } from './Member'
import { ContentTranslation } from './ContentTranslation'
import { Aggregate } from './QueryTable'

export interface Content {
  id?: number
  isPublished: boolean
  isMenu?: boolean
  translations: ContentTranslation[]
  image?: string
  author?: Member
  authorId?: string
  icon?: string
  type?: string
  tags?: {
    tag: Content
  }[]
  createdAt?: Date | string
  updatedAt?: Date | string
}

export interface ContentsData {
  content: Content[];
}

export interface ContentsVars {
  offset: number
  limit: number
}

export interface ContentVars {
  id: number
}

export interface ContentData {
  content_by_pk: Content
}

export interface GetContentsData {
  content_aggregate: Aggregate,
  content: Content[]
}

export interface UpsertContentResponse {
  insert_content_one: Content,
  insert_content_translations: {
    retuning: ContentTranslation[]
  }
}
export interface DeleteContentResponse {
  delete_content_by_pk: Content
}

export interface InsertContentResponse {
  insert_content_one: Content
}

export interface DeleteContentTagResponse {
  delete_content_tags_by_pk: {
    tag_id: number
  }
}

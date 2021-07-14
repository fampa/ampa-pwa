/* eslint-disable camelcase */
import { Member } from './Member'
import { ContentTranslation } from './ContentTranslation'
import { Aggregate } from './QueryTable'
import { Child } from './Child'

export interface Content {
  id?: number
  isPublished: boolean
  isMenu?: boolean
  translations: ContentTranslation[]
  image?: string
  caption?: string
  author?: Member
  authorId?: string
  icon?: string
  type?: string
  link?: string
  tags?: {
    tag: Content
  }[]
  participants?: {
    child: Child,
    childId?: number
    createdAt?: Date | string
  }[]
  spots?: number
  price?: number
  createdAt?: Date | string
  updatedAt?: Date | string
}

export interface ContentsData {
  content: Content[];
  content_aggregate?: Aggregate;
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

export interface UpsertContentTagsResponse {
  insert_content_tags: {
    affected_rows: number
  }
}

export interface JoinServiceResponse {
  insert_childService_one: unknown
}

export interface UnJoinServiceResponse {
  delete_childService_by_pk: Record<string, unknown>
}

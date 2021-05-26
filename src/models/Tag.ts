import { Aggregate } from './QueryTable'

/* eslint-disable camelcase */
export interface TagTranslation {
  tagId?: number,
  name: string,
  language: string
}

export interface Tag {
  id?: number,
  isMenu?: boolean,
  icon?: string,
  type?: string,
  translations?: TagTranslation[]
}

export interface TagsData {
  tags: Tag[]
}

export interface GetTagsData {
  tags: Tag[]
  tags_aggregate: Aggregate
}

export interface TagData {
  tags_by_pk: Tag
}

export interface UpsertContentTagsResponse {
  insert_content_tags: {
    affected_rows: number
  }
}

export interface UpsertTagResponse {
  insert_tags_one: {
    id: number
  }
}

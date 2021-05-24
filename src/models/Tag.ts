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
  icon: string,
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

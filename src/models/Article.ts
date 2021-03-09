import { Member } from './Member'

export interface Article {
    id: number
    status: string
    titleCat: string
    titleEs: string
    contentCat: string
    contentEs: string
    createdAt: Date
    image?: string
    author?: Member
    updatedAt?: Date
}

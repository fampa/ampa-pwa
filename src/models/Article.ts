import { Member } from './Member'
import { Translation } from './Translation'

export interface Article {
    id: number
    status: string
    translations: Translation[]
    image?: string
    author?: Member
    updatedAt?: Date
    createdAt?: Date
}

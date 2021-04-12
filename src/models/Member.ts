export interface Member {
    id: number
    firstName: string
    lastName: string
    email: string
    familyId: number
    photoURL?: string
    isadmin?: boolean
    phone?: string
    createdAt?: Date
    updatedAt?: Date
}

export interface Member {
    id: number
    firstName: string
    lastName: string
    email: string
    familyId: number
    photoURL?: string
    isAdmin?: boolean
    createdAt?: Date
    updatedAt?: Date
}

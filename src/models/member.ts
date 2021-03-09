export interface Member {
    id: number
    firstName: string
    lastName: string
    email: string
    isAdmin: boolean
    familyId: number
    createdAt?: Date
    updatedAt?: Date
}

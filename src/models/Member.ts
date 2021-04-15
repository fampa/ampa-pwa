/* eslint-disable camelcase */
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

export interface MembersData {
    members: Member[];
}

export interface MembersVars {
    offset: number
    limit: number
}

export interface MemberVars {
    id: string
}

export interface MemberData {
    members_by_pk: Member
}

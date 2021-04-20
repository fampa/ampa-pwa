export interface Child {
  id?: number
  firstName: string
  lastName: string
  birthDate: string
  familyId?: number
  createdAt?: Date
  updatedAt?: Date
}

export interface ChildrenData {
  members: Child[];
}

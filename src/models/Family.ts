import { Child } from './Child'

export interface Family {
  id?: number
  name: string
  children: Child[]
  createdAt?: Date
  updatedAt?: Date
}

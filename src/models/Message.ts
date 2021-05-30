export interface Message {
  id?: number
  title: string,
  content?: string,
  createdAt?: Date | string,
  updatedAt?: Date | string,
  status?: {
    read: boolean
  }
}

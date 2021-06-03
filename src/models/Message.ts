/* eslint-disable camelcase */
export interface Message {
  id?: number
  title: string,
  content?: string,
  createdAt?: Date | string,
  updatedAt?: Date | string,
  status?: {
    read: boolean
  },
  click_action?: string
}

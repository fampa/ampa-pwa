/* eslint-disable camelcase */
export interface ServiceType {
  id: number
  name?: string
  description?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface Service {
  id: number
  type?: ServiceType
  name?: string
  description?: string
  periodicity?: string
  price?: number
  isAvailable?: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface ServiceData {
  service_types: Service[]
}

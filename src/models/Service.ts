/* eslint-disable camelcase */
export interface ServiceType {
  id: number
  name?: string
  description?: string
  icon?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface Service {
  id: number
  type?: ServiceType
  name?: string
  image?: string
  description?: string
  periodicity?: string
  price?: number
  isAvailable?: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface ServicesTypeData {
  service_types: ServiceType[]
}

export interface ServicesData {
  services: Service[]
}

export interface ServiceData {
  services_by_pk: Service
}

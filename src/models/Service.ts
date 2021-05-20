import { Aggregate, QueryTableOptions } from './QueryTable'

/* eslint-disable camelcase */
export interface ServiceType {
  id?: number
  name?: string
  description?: string
  icon?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface Service {
  id: number
  type?: ServiceType
  typeId?: number
  name?: string
  image?: string
  description?: string
  periodicity?: string
  price?: number
  spots?: number
  participants?: Record<string, unknown>[]
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

export interface JoinServiceResponse {
  insert_childService_one: unknown
}

export interface UnJoinServiceResponse {
  delete_childService_by_pk: Record<string, unknown>
}

export interface GetServiceTypesData {
  service_types_aggregate: Aggregate
  service_types: ServiceType[]
}

export interface upsertServiceTypeResult {
  insert_service_types_one: ServiceType
}

export interface upsertServiceResult {
  insert_services_one: Service
}

export interface upsertServiceTypeInput {
  insertInput: ServiceType
}

export interface upsertServiceInput {
  insertInput: Service
}

export interface GetServiceTypeByID {
  service_types_by_pk: ServiceType
}

export interface GetServicesByTypeResult {
  services: Service[]
  services_aggregate: Aggregate
}

export type GetServicesByTypeInput = QueryTableOptions & {
  typeId: number
}

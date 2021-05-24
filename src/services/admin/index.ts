import { useMutation, useQuery } from '@vue/apollo-composable'
import getArticles from './queries/getArticles.gql'
import getContentsByType from './queries/getContentsByType.gql'
import getMembers from './queries/getMembers.gql'
import getServiceTypes from './queries/getServiceTypes.gql'
import getServiceTypeById from './queries/getServiceTypeById.gql'
import upsertService from './queries/upsertService.gql'
import upsertServiceType from './queries/upsertServiceType.gql'
import removeServiceType from './queries/removeServiceType.gql'
import removeService from './queries/removeService.gql'
import getServicesByType from './queries/getServicesByType.gql'
import getServiceById from './queries/getServiceById.gql'
import getTags from './queries/getTags.gql'
import { GetArticlesData } from 'src/models/Article'
import { QueryTableOptions } from 'src/models/QueryTable'
import { GetMembersData } from 'src/models/Member'
import { Service, ServiceData, GetServiceTypeByID, GetServiceTypesData, ServiceType, upsertServiceTypeResult, upsertServiceTypeInput, GetServicesByTypeResult, GetServicesByTypeInput, upsertServiceResult, upsertServiceInput } from 'src/models/Service'
import { GetContentsData } from 'src/models/Content'
import { GetTagsData } from 'src/models/Tag'

export class AdminService {
  getArticles = (options: QueryTableOptions) => {
    const response = useQuery<GetArticlesData, QueryTableOptions>(
      getArticles,
      { ...options },
      {
        fetchPolicy: 'no-cache',
        nextFetchPolicy: 'no-cache'
      }
    )
    return response
  }

  getContentsByType = (options: QueryTableOptions) => {
    const response = useQuery<GetContentsData, QueryTableOptions>(
      getContentsByType,
      { ...options },
      {
        fetchPolicy: 'no-cache',
        nextFetchPolicy: 'no-cache'
      }
    )
    return response
  }

  getMembers = (options: QueryTableOptions) => {
    const response = useQuery<GetMembersData, QueryTableOptions>(
      getMembers,
      { ...options },
      {
        fetchPolicy: 'no-cache',
        nextFetchPolicy: 'no-cache'
      }
    )
    return response
  }

  getServiceTypes = (options: QueryTableOptions) => {
    const response = useQuery<GetServiceTypesData, QueryTableOptions>(
      getServiceTypes,
      { ...options },
      {
        fetchPolicy: 'no-cache',
        nextFetchPolicy: 'no-cache'
      }
    )
    return response
  }

  getServiceTypeById = (id: number) => {
    const response = useQuery<GetServiceTypeByID, ServiceType>(
      getServiceTypeById,
      { id },
      {
        fetchPolicy: 'no-cache',
        nextFetchPolicy: 'no-cache'
      }
    )
    return response
  }

  getServicesByType = (options: GetServicesByTypeInput) => {
    const response = useQuery<GetServicesByTypeResult, GetServicesByTypeInput>(
      getServicesByType,
      { ...options },
      {
        fetchPolicy: 'no-cache',
        nextFetchPolicy: 'no-cache'
      }
    )
    return response
  }

  upsertServiceType = () => {
    const response = useMutation<upsertServiceTypeResult, upsertServiceTypeInput>(
      upsertServiceType
    )
    return response
  }

  upsertService = () => {
    const response = useMutation<upsertServiceResult, upsertServiceInput>(
      upsertService
    )
    return response
  }

  removeServiceType = () => {
    const response = useMutation<upsertServiceTypeResult, ServiceType>(
      removeServiceType
    )
    return response
  }

  removeService = () => {
    const response = useMutation<upsertServiceResult, Service>(
      removeService
    )
    return response
  }

  getServiceById = (id: number) => {
    const response = useQuery<ServiceData>(
      getServiceById,
      { id }
    )

    return response
  }

  getTags = (options: QueryTableOptions) => {
    const response = useQuery<GetTagsData, QueryTableOptions>(
      getTags,
      { ...options },
      {
        fetchPolicy: 'no-cache',
        nextFetchPolicy: 'no-cache'
      }
    )
    return response
  }
}

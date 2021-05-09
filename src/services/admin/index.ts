import { useQuery } from '@vue/apollo-composable'
import getArticles from './queries/getArticles.gql'
import getPages from './queries/getPages.gql'
import getMembers from './queries/getMembers.gql'
import getServiceTypes from './queries/getServiceTypes.gql'
import { GetArticlesData } from 'src/models/Article'
import { QueryTableOptions } from 'src/models/QueryTable'
import { GetMembersData } from 'src/models/Member'
import { GetPagesData } from 'src/models/Page'
import { GetServiceTypesData } from 'src/models/Service'

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

  getPages = (options: QueryTableOptions) => {
    const response = useQuery<GetPagesData, QueryTableOptions>(
      getPages,
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
}
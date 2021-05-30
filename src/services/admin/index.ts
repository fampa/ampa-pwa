import { useQuery } from '@vue/apollo-composable'
import getContentsByType from './queries/getContentsByType.gql'
import getMembers from './queries/getMembers.gql'
import { QueryTableOptions } from 'src/models/QueryTable'
import { GetMembersData } from 'src/models/Member'
import { ContentsData } from 'src/models/Content'

export class AdminService {
  getContentsByType = (options: QueryTableOptions) => {
    const response = useQuery<ContentsData, QueryTableOptions>(
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
}

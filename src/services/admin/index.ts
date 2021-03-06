/* eslint-disable camelcase */
import { useQuery, useMutation } from '@vue/apollo-composable'
import getContentsByType from './queries/getContentsByType.gql'
import getMembers from './queries/getMembers.gql'
import addMessage from './queries/addMessage.gql'
import addMessageMembers from './queries/addMessageMembers.gql'
import getFamilies from './queries/getFamilies.gql'
import { Aggregate, QueryTableOptions } from 'src/models/QueryTable'
import { GetMembersData } from 'src/models/Member'
import { ContentsData } from 'src/models/Content'
import { Message } from 'src/models/Message'
import { Family } from 'src/models/Family'

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

  getFamilies = (options: QueryTableOptions) => {
    const response = useQuery<{families_aggregate: Aggregate, families: Family[]}, QueryTableOptions>(
      getFamilies,
      { ...options },
      {
        fetchPolicy: 'no-cache',
        nextFetchPolicy: 'no-cache'
      }
    )
    return response
  }

  addMessage = () => {
    const response = useMutation<{insert_messages_one: Message}, { message: Message}>(
      addMessage
    )
    return response
  }

  addMessageMembers = () => {
    const response = useMutation<{insert_members_messages: { effected_rows: number}}, { objects: {memberId: string, messageId: number}[]}>(
      addMessageMembers
    )
    return response
  }
}

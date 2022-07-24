/* eslint-disable camelcase */
import { useQuery, useMutation } from '@vue/apollo-composable'
import getContentsByType from './queries/getContentsByType.gql'
import getMembers from './queries/getMembers.gql'
import addMessage from './queries/addMessage.gql'
import addMessageMembers from './queries/addMessageMembers.gql'
import getFamilies from './queries/getFamilies.gql'
import getChildren from './queries/getChildren.gql'
import toggleBaixaChildren from './queries/toggleBaixaChildren.gql'
import toggleBaixaFamilies from './queries/toggleBaixaFamilies.gql'
import familiesPendingInactive from './queries/familiesPendingInactive.gql'
import { Aggregate, QueryTableOptions } from 'src/models/QueryTable'
import { GetMembersData } from 'src/models/Member'
import { ContentsData } from 'src/models/Content'
import { Message } from 'src/models/Message'
import { Family } from 'src/models/Family'
import { Child } from 'src/models/Child'

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

  getFamiliesPendingInactive = (options: QueryTableOptions) => {
    const response = useQuery<{families_aggregate: Aggregate, families: Family[]}, QueryTableOptions>(
      familiesPendingInactive,
      { ...options },
      {
        fetchPolicy: 'no-cache',
        nextFetchPolicy: 'no-cache'
      }
    )
    return response
  }

  getChildren = (options: QueryTableOptions) => {
    const response = useQuery<{children_aggregate: Aggregate, children: Child[]}, QueryTableOptions>(
      getChildren,
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

  donarBaixaChildren = () => {
    const response = useMutation<{update_children: { affected_rows: number}}, { ids: number[], inactive: boolean}>(
      toggleBaixaChildren
    )
    return response
  }

  donarBaixaFamilies = () => {
    const response = useMutation<{update_families: { affected_rows: number}}, { ids: number[], inactive: boolean, manualPayment: boolean}>(
      toggleBaixaFamilies
    )
    return response
  }

  addMessageMembers = () => {
    const response = useMutation<{insert_members_messages: { affected_rows: number}}, { objects: {memberId: string, messageId: number}[]}>(
      addMessageMembers
    )
    return response
  }
}

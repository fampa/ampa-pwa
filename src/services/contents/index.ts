/* eslint-disable camelcase */
import { useQuery, useMutation } from '@vue/apollo-composable'
import getMenuItems from './queries/getMenuItems.gql'
import getContentById from './queries/getContentById.gql'
import unJoinService from './queries/unJoinService.gql'
import joinService from './queries/joinService.gql'
import upsertContent from './queries/upsertContent.gql'
import upsertContentTags from './queries/upsertContentTags.gql'
import insertContent from './queries/insertContent.gql'
import deleteContent from './queries/deleteContent.gql'
import getTags from './queries/getTags.gql'
import getContentsByTagId from './queries/getContentsByTagId.gql'
import getContentsFrontPage from './queries/getContentsFrontPage.gql'
import removeContentTags from './queries/removeContentTags.gql'
import getMessageById from './queries/getMessageById.gql'
import setMessageRead from './queries/setMessageRead.gql'
import deleteMessageMember from './queries/deleteMessageMember.gql'
import { MembersService } from '../members'
import axios from 'axios'
import { ContentData, ContentsData, DeleteContentResponse, DeleteContentTagResponse, InsertContentResponse, JoinServiceResponse, UnJoinServiceResponse, UpsertContentResponse, UpsertContentTagsResponse } from 'src/models/Content'
import { apolloClient } from 'src/boot/apollo'
import { CachePersistor } from 'apollo3-cache-persist'
import { Message } from 'src/models/Message'

const membersService = new MembersService()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// const nullResponse = { result: null, onResult: () => null, loading: false, onError: () => null, refetch: () => null, fetchMore: () => new Promise<{data: Record<string, unknown>}>((resolve, reject) => { resolve({ data: null }) }) }

export class ContentsService {
  getMenuItems = () => {
    const response = useQuery<ContentsData>(
      getMenuItems
    )

    return response
  }

  getContentById = (id: number, isAdmin = false) => {
    const configuration = isAdmin ? null : {
      context: {
        headers: {
          'x-hasura-role': 'public'
        }
      }
    }
    const response = useQuery<ContentData>(
      getContentById,
      () => ({ id, isAdmin }),
      configuration
    )

    return response
  }

  getContentsByTagId = ({ id }) => {
    const response = useQuery<ContentsData>(
      getContentsByTagId,
      () => ({ id }),
      {
        notifyOnNetworkStatusChange: true,
        nextFetchPolicy: 'no-cache',
        fetchPolicy: 'no-cache'
      }
    )

    return response
  }

  getContentsFrontPage = ({ type = 'article', offset = 0, limit = 10 }) => {
    const response = useQuery<ContentsData>(
      getContentsFrontPage,
      () => ({ type, offset, limit }),
      {
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first',
        notifyOnNetworkStatusChange: true
      }
    )

    return response
  }

  serviceMessage = async (messageObj: Record<string, unknown>) => {
    const endpoint = `${membersService.axiosEndpoint}/service/`
    const response = await axios
      .post(endpoint, messageObj)
    return response
  }

  joinService = () => {
    const response = useMutation<JoinServiceResponse>(
      joinService
    )

    return response
  }

  unJoinService = () => {
    const response = useMutation<UnJoinServiceResponse>(
      unJoinService
    )

    return response
  }

  upsertContent = () => {
    const response = useMutation<UpsertContentResponse>(
      upsertContent
    )

    return response
  }

  insertContent = () => {
    const response = useMutation<InsertContentResponse>(
      insertContent
    )

    return response
  }

  deleteContent = () => {
    const response = useMutation<DeleteContentResponse>(
      deleteContent
    )

    return response
  }

  upsertContentTags = () => {
    const response = useMutation<UpsertContentTagsResponse>(
      upsertContentTags
    )

    return response
  }

  deleteContentTags = () => {
    const response = useMutation<DeleteContentTagResponse>(
      removeContentTags
    )

    return response
  }

  getTags = () => {
    const response = useQuery<ContentsData>(
      getTags,
      {},
      {
        fetchPolicy: 'no-cache',
        nextFetchPolicy: 'no-cache'
      }
    )

    return response
  }

  getMessageById = (id: number) => {
    const response = useQuery<{messages_by_pk: Message}>(
      getMessageById,
      () => ({ id }),
      {
        notifyOnNetworkStatusChange: true,
        nextFetchPolicy: 'no-cache',
        fetchPolicy: 'no-cache'
      }
    )

    return response
  }

  setMessageRead = () => {
    const response = useMutation<{update_members_messages_by_pk: { read: true}}, {memberId: string, messageId: number}>(
      setMessageRead
    )

    return response
  }

  deleteMessageMember = () => {
    const response = useMutation<{delete_members_messages_by_pk: { memberId: string, messageId: number }}>(
      deleteMessageMember
    )

    return response
  }

  clearCache = async () => {
    const persistor = new CachePersistor({
      cache: apolloClient.cache,
      storage: window.localStorage
    })
    await apolloClient.clearStore()
    await apolloClient.resetStore()
    await apolloClient.cache.reset()
    await persistor.purge()
  }
}

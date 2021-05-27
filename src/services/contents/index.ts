import { useQuery, useMutation } from '@vue/apollo-composable'
import getTipusServeis from './queries/getTipusServeis.gql'
import getMenuItems from './queries/getMenuItems.gql'
import getContentById from './queries/getContentById.gql'
import getServicesByType from './queries/getServicesByType.gql'
import getServiceById from './queries/getServiceById.gql'
import unJoinService from './queries/unJoinService.gql'
import joinService from './queries/joinService.gql'
import upsertContent from './queries/upsertContent.gql'
import upsertContentTags from './queries/upsertContentTags.gql'
import insertContent from './queries/insertContent.gql'
import deleteContent from './queries/deleteContent.gql'
import getTags from './queries/getTags.gql'
import getTagById from './queries/getTagById.gql'
import upsertTag from './queries/upsertTag.gql'
import getContentsByType from './queries/getContentsByType.gql'
import getContentsByTagId from './queries/getContentsByTagId.gql'
import getContentsFrontPage from './queries/getContentsFrontPage.gql'
import removeContentTags from './queries/removeContentTags.gql'
import { ServicesTypeData, UnJoinServiceResponse, ServicesData, ServiceData, JoinServiceResponse } from 'src/models/Service'
import { MembersService } from '../members'
import axios from 'axios'
import { ContentData, ContentsData, DeleteContentResponse, DeleteContentTagResponse, InsertContentResponse, UpsertContentResponse } from 'src/models/Content'
import { TagData, UpsertContentTagsResponse, UpsertTagResponse } from 'src/models/Tag'

const membersService = new MembersService()

export class ContentsService {
  getTipusServeis = () => {
    const response = useQuery<ServicesTypeData>(
      getTipusServeis
    )

    return response
  }

  getMenuItems = () => {
    const response = useQuery<ContentsData>(
      getMenuItems
    )

    return response
  }

  getContentById = (id: number, isAdmin = false) => {
    const response = useQuery<ContentData>(
      getContentById,
      () => ({ id, isAdmin })
    )

    return response
  }

  getContentsByTagId = (id: number) => {
    const response = useQuery<ContentsData>(
      getContentsByTagId,
      () => ({ id })
    )

    return response
  }

  getContentsByType = (type = 'article') => {
    const response = useQuery<ContentsData>(
      getContentsByType,
      () => ({ type })
    )

    return response
  }

  getContentsFrontPage = ({ type = 'article', offset = 0, limit = 10 }) => {
    const response = useQuery<ContentsData>(
      getContentsFrontPage,
      () => ({ type, offset, limit }),
      { notifyOnNetworkStatusChange: true }
    )

    return response
  }

  getServicesByTypeId = (typeId: number) => {
    const response = useQuery<ServicesData>(
      getServicesByType,
      { typeId }
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
      getTags
    )

    return response
  }

  getTagById = (id: number) => {
    const response = useQuery<TagData>(
      getTagById,
      {
        id
      }
    )

    return response
  }

  upsertTag = () => {
    const response = useMutation<UpsertTagResponse>(
      upsertTag
    )

    return response
  }
}

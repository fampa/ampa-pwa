import { useQuery, useMutation } from '@vue/apollo-composable'
import getTipusServeis from './queries/getTipusServeis.gql'
import getPages from './queries/getPages.gql'
import getContentById from './queries/getContentById.gql'
import getServicesByType from './queries/getServicesByType.gql'
import getServiceById from './queries/getServiceById.gql'
import unJoinService from './queries/unJoinService.gql'
import joinService from './queries/joinService.gql'
import upsertContent from './queries/upsertContent.gql'
import insertContent from './queries/insertContent.gql'
import deleteContent from './queries/deleteContent.gql'
import getTags from './queries/getTags.gql'
import getTagById from './queries/getTagById.gql'
import { ServicesTypeData, UnJoinServiceResponse, ServicesData, ServiceData, JoinServiceResponse } from 'src/models/Service'
import { MembersService } from '../members'
import axios from 'axios'
import { ContentData, ContentsData, DeleteContentResponse, InsertContentResponse, UpsertContentResponse } from 'src/models/Content'
import { TagData, TagsData } from 'src/models/Tag'

const membersService = new MembersService()

export class ContentsService {
  getTipusServeis = () => {
    const response = useQuery<ServicesTypeData>(
      getTipusServeis
    )

    return response
  }

  getPagesList = () => {
    const response = useQuery<ContentsData>(
      getPages
    )

    return response
  }

  getContentById = (id: number) => {
    const response = useQuery<ContentData>(
      getContentById,
      () => ({ id })
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

  getTags = () => {
    const response = useQuery<TagsData>(
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
}

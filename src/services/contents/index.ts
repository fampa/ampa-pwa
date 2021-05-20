import { useQuery, useMutation } from '@vue/apollo-composable'
import getTipusServeis from './queries/getTipusServeis.gql'
import getPages from './queries/getPages.gql'
import getPageById from './queries/getPageById.gql'
import getServicesByType from './queries/getServicesByType.gql'
import getServiceById from './queries/getServiceById.gql'
import unJoinService from './queries/unJoinService.gql'
import joinService from './queries/joinService.gql'
import { ServicesTypeData, UnJoinServiceResponse, ServicesData, ServiceData, JoinServiceResponse } from 'src/models/Service'
import { PageData, PagesData } from 'src/models/Page'
import { MembersService } from '../members'
import axios from 'axios'

const membersService = new MembersService()

export class ContentsService {
  getTipusServeis = () => {
    const response = useQuery<ServicesTypeData>(
      getTipusServeis
    )

    return response
  }

  getPagesList = () => {
    const response = useQuery<PagesData>(
      getPages
    )

    return response
  }

  getPageById = (id: number) => {
    const response = useQuery<PageData>(
      getPageById,
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
}

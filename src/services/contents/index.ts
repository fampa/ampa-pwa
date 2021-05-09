import { useQuery } from '@vue/apollo-composable'
import getTipusServeis from './queries/getTipusServeis.gql'
import getPages from './queries/getPages.gql'
import getPageById from './queries/getPageById.gql'
import getServicesByType from './queries/getServicesByType.gql'
import getServiceById from './queries/getServiceById.gql'
import { ServicesTypeData, ServicesData, ServiceData } from 'src/models/Service'
import { PageData, PagesData } from 'src/models/Page'

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
}
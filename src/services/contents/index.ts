import { useQuery } from '@vue/apollo-composable'
// import gql from 'graphql-tag'
import getTipusServeis from './queries/getTipusServeis.gql'
import getPages from './queries/getPages.gql'
import { ServiceData } from 'src/models/Service'
import { PagesData } from 'src/models/Page'

export class ContentsService {
  getTipusServeis = () => {
    const response = useQuery<ServiceData>(
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
}

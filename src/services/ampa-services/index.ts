import { useQuery } from '@vue/apollo-composable'
// import gql from 'graphql-tag'
import getTipusServeis from './queries/getTipusServeis.gql'
import { apolloClient } from 'src/boot/apollo'
import { ServiceData } from 'src/models/Service'

export class AmpaServicesService {
  getTipusServeis = () => {
    const response = useQuery<ServiceData>(
      getTipusServeis
    )

    return response
  }

  clearCache = async () => {
    await apolloClient.clearStore()
  }
}

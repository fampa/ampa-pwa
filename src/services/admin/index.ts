import { useQuery } from '@vue/apollo-composable'
import getArticles from './queries/getArticles.gql'
import { GetArticlesData, GetArticlesOptions } from 'src/models/Article'

export class AdminService {
  getArticles = (options: GetArticlesOptions) => {
    const response = useQuery<GetArticlesData, GetArticlesOptions>(
      getArticles,
      { ...options },
      {
        fetchPolicy: 'no-cache',
        nextFetchPolicy: 'no-cache'
      }
    )
    return response
  }
}

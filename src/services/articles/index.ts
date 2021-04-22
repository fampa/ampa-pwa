// import { useQuery, useResult } from '@vue/apollo-composable'
import { useQuery } from '@urql/vue'
// import gql from 'graphql-tag'
import getArticles from 'src/services/articles/queries/getArticles.gql'
import getArticleById from 'src/services/articles/queries/getArticleById.gql'
import { ArticleData, ArticlesData, ArticleVars, ArticlesVars } from '@/models/Article'

export class ArticlesService {
  getAll = (offset: number, limit: number) => {
    const result = useQuery<ArticlesData, ArticlesVars>({
      query: getArticles,
      variables: { offset, limit }
    })
    return result
  }

  getById = (id: number) => {
    const result = useQuery<ArticleData, ArticleVars>({
      query: getArticleById,
      variables: { id }
    }
    )

    return result
  }

  clearCache = () => {
    console.log('TODO clear cache')
  }
}

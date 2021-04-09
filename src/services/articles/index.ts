import { useQuery, useResult } from '@vue/apollo-composable'
// import gql from 'graphql-tag'
import getArticles from './queries/getArticles.gql'
import getArticleById from './queries/getArticleById.gql'
import { ArticleData, ArticlesData, ArticleVars, ArticlesVars } from '@/models/Article'
import { apolloClient } from 'src/boot/apollo'

export class ArticlesService {
  getAll = (offset: number, limit: number) => {
    const { result, loading, error, fetchMore } = useQuery<ArticlesData, ArticlesVars>(getArticles, { offset, limit })
    const articles = useResult(result, null, data => data.articles)
    return { articles, loading, error, fetchMore }
  }

  getById = (id: number) => {
    const { result, loading, error } = useQuery<ArticleData, ArticleVars>(
      getArticleById,
      { id }
    )
    const article = useResult(result, null, data => data.articles_by_pk)

    return { article, loading, error }
  }

  clearCache = async () => {
    await apolloClient.clearStore()
  }
}

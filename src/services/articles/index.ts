import { useQuery, useResult } from '@vue/apollo-composable'
// import gql from 'graphql-tag'
import getArticles from './queries/getArticles.gql'
import getArticleById from './queries/getArticleById.gql'
import { ArticleData, ArticlesData, ArticleVars, ArticlesVars } from 'src/models/Article'
import { apolloClient } from 'src/boot/apollo'
import { CachePersistor } from 'apollo3-cache-persist'

export class ArticlesService {
  getAll = (offset: number, limit: number) => {
    const response = useQuery<ArticlesData, ArticlesVars>(
      getArticles,
      { offset, limit }
    )
    const articles = useResult(response.result, null, data => data.articles)
    return { articles, ...response }
  }

  getById = (id: number) => {
    const response = useQuery<ArticleData, ArticleVars>(
      getArticleById,
      { id }
    )
    const article = useResult(response.result, null, data => data.articles_by_pk)

    return { article, ...response }
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

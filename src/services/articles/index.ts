import { useQuery, useResult, useMutation } from '@vue/apollo-composable'
// import gql from 'graphql-tag'
import getArticles from './queries/getArticles.gql'
import getArticleById from './queries/getArticleById.gql'
import upsertArticle from './queries/upsertArticle.gql'
import deleteArticle from './queries/deleteArticle.gql'
import insertArticle from './queries/insertArticle.gql'
import { ArticleData, InsertArticleResponse, DeleteArticleResponse, ArticlesData, ArticleVars, ArticlesVars, UpsertArticleResponse } from 'src/models/Article'
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
    if (!id) return { article: null, onResult: null, loading: false, error: null, onError: null }
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

  upsertArticle = () => {
    const response = useMutation<UpsertArticleResponse>(
      upsertArticle
    )

    return response
  }

  insertArticle = () => {
    const response = useMutation<InsertArticleResponse>(
      insertArticle
    )

    return response
  }

  deleteArticle = () => {
    const response = useMutation<DeleteArticleResponse>(
      deleteArticle
    )

    return response
  }
}

import { useQuery, useResult } from '@vue/apollo-composable'
// import gql from 'graphql-tag'
import getArticles from './queries/getArticles.gql'
import getArticleById from './queries/getArticleById.gql'
import { Article, ArticleData } from '@/models/Article'

export class ArticlesService {
  getAll = () => {
    const { result, loading, error } = useQuery<ArticleData>(getArticles)
    const articles = useResult(result, null, data => data.articles)
    return { articles, articlesLoading: loading, articlesError: error }
  }

  getById = (id: number) => {
    const { result, loading, error } = useQuery<Article>(getArticleById, {
      variables: { id }
    })
    return { result, loading, error }
  }
}

import { useQuery, useResult } from '@vue/apollo-composable'
// import gql from 'graphql-tag'
import getArticles from './queries/getArticles.gql'
import getArticleById from './queries/getArticleById.gql'
import { ArticleData, ArticlesData, ArticleVars } from '@/models/Article'

export class ArticlesService {
  getAll = () => {
    const { result, loading, error } = useQuery<ArticlesData>(getArticles)
    const articles = useResult(result, null, data => data.articles)
    return { articles, loading, error }
  }

  getById = (id: number) => {
    const { result, loading, error } = useQuery<ArticleData, ArticleVars>(
      getArticleById,
      { id }
    )
    const article = useResult(result, null, data => data.articles_by_pk)

    return { article, loading, error }
  }
}

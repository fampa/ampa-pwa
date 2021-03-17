import { useQuery, useResult } from '@vue/apollo-composable'
// import gql from 'graphql-tag'
import getArticles from './queries/getArticles.gql'
import { ArticleData } from '@/models/Article'

export class ArticlesService {
  getAll = () => {
    const { result, loading, error } = useQuery<ArticleData>(getArticles)
    const articles = useResult(result, null, data => data.articles)
    return { articles, articlesLoading: loading, articlesError: error }
  }
}

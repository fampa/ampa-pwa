import { useQuery, useResult } from '@vue/apollo-composable'
import gql from 'graphql-tag'
import { ArticleData } from '@/models/Article'

export const getArticles = () => {
  const { result, loading, error } = useQuery<ArticleData>(gql`
        query getArticles {
            articles {
              id
              status
              translations {
                  title
                  slug
                  language
                  content
              }
            }
        }
        `)
  const articles = useResult(result, null, data => data.articles)
  return { articles, loading, error }
}

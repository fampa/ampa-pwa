import { useQuery, useResult } from '@vue/apollo-composable'
import gql from 'graphql-tag'
import { ArticleData } from '@/models/Article'

export const getArticles = () => {
  const { result, loading, error } = useQuery<ArticleData>(gql`
        query getArticles {
            articles(order_by: {created_at: desc}) {
              id
              status
              image
              created_at
              updated_at
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
  return { articles, articlesLoading: loading, articlesError: error }
}

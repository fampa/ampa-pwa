<template>
  <q-page class="row items-center justify-evenly">
    <div v-for="article in articles" :key="article.id">
      <news-card :article="article"></news-card>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

import NewsCard from 'components/NewsCard.vue'
import { Article } from '@/models/Article'
import { useQuery } from '@vue/apollo-composable'
import gql from 'graphql-tag'

export default defineComponent({
  name: 'PageIndex',
  components: { NewsCard },
  setup () {
    const articles = ref<Article[]>([
      {
        id: 1,
        status: 'PUBLISHED',
        createdAt: new Date(),
        translations: [
          {
            id: 1,
            title: 'Títol',
            content: 'Contingut',
            slug: 'slug',
            language: 'CA'
          }
        ]
      }
    ])

    const { result } = useQuery(gql`
      query getArticles {
        articles {
          id
          translations {
            title
            slug
            language
            content
          }
        }
      }
    `)

    console.log('result', result.value)

    return {
      articles,
      result
    }
  }
})
</script>

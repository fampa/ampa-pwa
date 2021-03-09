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

export default defineComponent({
  name: 'PageIndex',
  components: { NewsCard },
  setup () {
    const articles = ref<Article[]>([
      {
        id: 1,
        status: 'PUBLISHED',
        titleCat: 'Títol',
        titleEs: 'Título',
        contentCat: 'Contingut',
        contentEs: 'Contenido',
        createdAt: new Date()
      }
    ])

    return { articles }
  }
})
</script>

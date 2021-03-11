<template>
  <q-page class="row items-center justify-evenly">
    <div v-if="articles">
      <div v-for="article in articles" :key="article.id">
        <news-card :article="article"></news-card>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import NewsCard from 'components/NewsCard.vue'
import { getArticles } from 'src/services/articles'

export default defineComponent({
  name: 'PageIndex',
  components: { NewsCard },
  setup () {
    const { articles } = getArticles()
    return {
      articles
    }
  }
})
</script>

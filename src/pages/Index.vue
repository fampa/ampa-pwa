<template>
  <q-page class="bg-grey-2 q-pa-md">
    <div v-if="articlesLoading">
      Loading...
    </div>
    <div v-else-if="articlesError">
      {{articlesError}}
    </div>
    <div v-else-if="articles">
      <div class="row items-start">
        <div class="col-12 col-sm-6 col-md-4 q-pa-sm" v-for="article in articles" :key="article.id">
          <news-card :article="article"></news-card>
        </div>
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
    const { articles, articlesLoading, articlesError } = getArticles()
    return {
      articles,
      articlesLoading,
      articlesError
    }
  }
})
</script>

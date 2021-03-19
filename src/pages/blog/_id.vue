<template>
  <q-page padding>
    Article
    <div v-if="article">
      {{ article.translations[0].title }}
    </div>
    {{ error }}
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { ArticlesService } from 'src/services/articles'
import { useRoute } from 'vue-router'

export default defineComponent({
  name: 'NewsDetails',
  setup () {
    const articlesService = new ArticlesService()
    const route = useRoute()
    const id = Number(route.params.id)

    const { article, loading, error } = articlesService.getById(id)

    return {
      article,
      loading,
      error
    }
  }
})
</script>

<template>
  <q-page padding>
    <!-- content -->
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { ArticlesService } from 'src/services/articles'

export default defineComponent({
  name: 'NewsDetails',
  setup () {
    const articlesService = new ArticlesService()
    const { articles, articlesLoading, articlesError } = articlesService.getAll()
    return {
      articles,
      articlesLoading,
      articlesError
    }
  }
})
</script>

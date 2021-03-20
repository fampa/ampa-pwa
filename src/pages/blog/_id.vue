<template>
  <q-page padding>
    Article
    <div v-if="article">
      {{
        article.translations.find(t=>t.language === language)?.title ?
        article.translations.find(t=>t.language === language)?.title :
        article.translations.find(t=>t.language === fallbackLanguage)?.title
      }}
    </div>
    {{ error }}
  </q-page>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { ArticlesService } from 'src/services/articles'
import { useRoute } from 'vue-router'
import { useStore } from 'src/services/store'

export default defineComponent({
  name: 'NewsDetails',
  setup () {
    const articlesService = new ArticlesService()
    const route = useRoute()
    const id = Number(route.params.id)
    const store = useStore()
    const language = computed(() => store.state.settings.language)
    const fallbackLanguage = computed(() => store.state.settings.fallbackLanguage)
    const { article, loading, error } = articlesService.getById(id)

    return {
      article,
      loading,
      error,
      language,
      fallbackLanguage
    }
  }
})
</script>

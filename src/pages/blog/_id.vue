<template>
  <q-page padding>
    Article
    <div v-if="article">
      {{title}}
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
    const title = computed(() => {
      if (article.value?.translations.find(t => t.language === language.value)?.title) {
        return article.value?.translations.find(t => t.language === language.value)?.title
      } else {
        return article.value?.translations.find(t => t.language === fallbackLanguage.value)?.title
      }
    })
    const fallbackLanguage = computed(() => store.state.settings.fallbackLanguage)
    const { article, loading, error } = articlesService.getById(id)

    return {
      article,
      loading,
      error,
      language,
      fallbackLanguage,
      title
    }
  }
})
</script>

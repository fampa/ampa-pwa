<template>
  <q-page padding>
    <div v-if="loading">
      <q-skeleton type="text" height="60px" />
      <q-skeleton height="200px" square />
      <q-skeleton type="text" />
      <q-skeleton type="text" />
    </div>
    <div class="article" v-else-if="article">
      <h1 class="text-h4">{{title}}</h1>
      <div class="subtitle">{{formatedDate}}. <span class="updated" v-if="article.created_at !== article.updated_at">{{$t('updatedAt', {date: formatedUpdatedDate})}}</span></div>
      <q-img
        class="image"
        fit="cover"
        v-if="article.image"
        :src="article.image">
      </q-img>
      <div class="content" v-html="content"></div>
    </div>
    <div v-else-if="error">
      {{error}}
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { date } from 'quasar'
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
    const content = computed(() => {
      if (article.value?.translations.find(t => t.language === language.value)?.content) {
        return article.value?.translations.find(t => t.language === language.value)?.content
      } else {
        return article.value?.translations.find(t => t.language === fallbackLanguage.value)?.content
      }
    })
    const fallbackLanguage = computed(() => store.state.settings.fallbackLanguage)

    const formatedDate = computed(() => date.formatDate(article.value?.created_at, 'DD/MM/YYYY, HH:mm'))
    const formatedUpdatedDate = computed(() => date.formatDate(article.value?.updated_at, 'DD/MM/YYYY, HH:mm'))

    const { article, loading, error } = articlesService.getById(id)

    return {
      article,
      loading,
      error,
      title,
      formatedDate,
      formatedUpdatedDate,
      content
    }
  }
})
</script>
<style scoped lang="scss">
.image {
  height: 200px;
}
.text-h4 {
  margin-bottom: 0;
}
.subtitle {
  opacity: 0.6;
}
.updated {
  font-style: italic;
  font-size: 0.9em;
}
.content {
  margin-top: 2rem;
  text-align: justify;
  hyphens: auto;
}
.article {
  max-width: 600px;
  margin: auto auto;
}
</style>

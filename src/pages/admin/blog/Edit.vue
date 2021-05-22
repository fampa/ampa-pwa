<template>
    <article-editor v-if="article" @guardar="guardar" :input-article="article"></article-editor>
</template>

<script lang="ts">
import ArticleEditor from 'src/components/ArticleEditor/index.vue'
import { ref, onMounted, computed } from 'vue'
import { Article } from 'src/models/Article'
import { ArticlesService } from 'src/services/articles'
import { useRoute } from 'vue-router'
import { date } from 'quasar'
import { useI18n } from 'vue-i18n'

const formatDate = (inputDate: Date) => {
  return date.formatDate(inputDate, 'YYYY-MM-DD HH:mm')
}

export default {
  components: { ArticleEditor },
  setup () {
    const articlesService = new ArticlesService()
    const router = useRoute()
    const i18n = useI18n()

    // Data
    const id = computed(() => Number(router.params?.id))
    const article = ref<Article>(null)
    // Methods
    const guardar = (val) => {
      console.log('guardat', val)
    }

    onMounted(() => {
      const { article: databaseArticle, onResult } = articlesService.getById(id.value)

      if (id.value) {
        onResult(() => {
          const articleTemp = Object.assign({ ...databaseArticle.value }) as Article
          articleTemp.createdAt = formatDate(databaseArticle.value.createdAt)
          article.value = articleTemp
        })
      } else {
        article.value = {
          status: 'PUBLISHED',
          createdAt: formatDate(new Date()),
          image: null,
          translations: i18n.availableLocales.map(l => {
            return {
              title: '',
              language: l,
              content: ''
            }
          })
        }
      }
    })

    return {
      guardar,
      article
    }
  }

}
</script>

<style>

</style>

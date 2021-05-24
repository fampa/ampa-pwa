<template>
    <article-editor v-if="article" @guardar="guardar" @remove="remove" :loading="upsertLoading || insertLoading" :input-article="article"></article-editor>
</template>

<script lang="ts">
import ArticleEditor from 'src/components/TranslationEditor/index.vue'
import { ref, onMounted, computed } from 'vue'
import { Article } from 'src/models/Article'
import { ArticlesService } from 'src/services/articles'
import { useRoute, useRouter } from 'vue-router'
import { date, useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { cleanObject } from 'src/utilities/cleanObject'

const formatDate = (inputDate: Date) => {
  return date.formatDate(inputDate, 'YYYY-MM-DD HH:mm')
}

export default {
  components: { ArticleEditor },
  setup () {
    const articlesService = new ArticlesService()
    const route = useRoute()
    const router = useRouter()
    const i18n = useI18n()
    const $q = useQuasar()

    const { mutate: upsertArticle, loading: upsertLoading } = articlesService.upsertArticle()
    const { mutate: removeArticle } = articlesService.deleteArticle()
    const { mutate: insertArticle, loading: insertLoading } = articlesService.insertArticle()

    // Data
    const id = computed(() => Number(route.params?.id))
    const article = ref<Article>(null)
    // Methods
    const guardar = async (article) => {
      // console.log('guardat', article)
      const translations = article.translations
      cleanObject(translations)
      delete article.translations
      cleanObject(article)
      const variables = {
        article,
        translations
      }
      // console.log(variables)
      if (id.value) {
        await upsertArticle(variables)
          .then(() => {
            $q.notify(i18n.t('forms.savedOk'))
          })
          .catch(err => {
            console.error(err)
          })
      } else {
        variables.article.translations = {}
        variables.article.translations.data = variables.translations
        delete variables.translations
        await insertArticle(variables)
          .then(async () => {
            await router.replace('/admin/blog')
          })
          .then(() => {
            $q.notify(i18n.t('forms.savedOk'))
          })
          .catch(err => {
            console.error(err)
          })
      }
    }

    const remove = (article) => {
      $q.dialog({
        title: i18n.t('remove.title'),
        message: i18n.t('remove.question'),
        cancel: true,
        persistent: true
      }).onOk(async () => {
        await removeArticle({ id: article.value.id })
      }).onOk(async () => {
        // console.log('>>>> second OK catcher')
        $q.notify(i18n.t('remove.confirm'))
        await router.replace('/admin/blog')
      }).onCancel(() => {
        // console.log('>>>> Cancel')
      }).onDismiss(() => {
        // console.log('I am triggered on both OK and Cancel')
      })
    }

    onMounted(() => {
      const { article: databaseArticle, onResult } = articlesService.getById(id.value)

      if (id.value) {
        onResult(() => {
          const articleTemp = Object.assign({ ...databaseArticle.value }) as Article
          articleTemp.createdAt = formatDate(databaseArticle.value.createdAt)
          // console.log(articleTemp)
          article.value = articleTemp
        })
      } else {
        article.value = {
          status: 'DRAFT',
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
      article,
      upsertLoading,
      insertLoading,
      remove
    }
  }

}
</script>

<style>

</style>

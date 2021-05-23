<template>
    <article-editor v-if="page" @guardar="guardar" isPage @remove="remove" :loading="upsertLoading || insertLoading" :input-article="page"></article-editor>
</template>

<script lang="ts">
import ArticleEditor from 'src/components/ArticleEditor/index.vue'
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { date, useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { cleanObject } from 'src/utilities/cleanObject'
import { ContentsService } from 'src/services/contents'
import { Page } from 'src/models/Page'

const formatDate = (inputDate: Date | string) => {
  return date.formatDate(inputDate, 'YYYY-MM-DD HH:mm')
}

export default {
  components: { ArticleEditor },
  name: 'EditPage',
  setup () {
    const contentsService = new ContentsService()
    const route = useRoute()
    const router = useRouter()
    const i18n = useI18n()
    const $q = useQuasar()

    const { mutate: upsertPage, loading: upsertLoading } = contentsService.upsertPage()
    const { mutate: removePage } = contentsService.deletePage()
    const { mutate: insertPage, loading: insertLoading } = contentsService.insertPage()

    // Data
    const id = computed(() => Number(route.params?.id))
    const page = ref<Page>(null)
    // Methods
    const guardar = async (page) => {
      // console.log('guardat', page)
      const translations = page.translations
      cleanObject(translations)
      delete page.translations
      cleanObject(page)
      const variables = {
        page,
        translations
      }
      // console.log(variables)
      if (id.value) {
        await upsertPage(variables)
          .then(() => {
            $q.notify(i18n.t('forms.savedOk'))
          })
          .catch(err => {
            console.error(err)
          })
      } else {
        variables.page.translations = {}
        variables.page.translations.data = variables.translations
        delete variables.translations
        await insertPage(variables)
          .then(async () => {
            await router.replace('/admin/pages')
          })
          .then(() => {
            $q.notify(i18n.t('forms.savedOk'))
          })
          .catch(err => {
            console.error(err)
          })
      }
    }

    const remove = (page) => {
      $q.dialog({
        title: i18n.t('remove.title'),
        message: i18n.t('remove.question'),
        cancel: true,
        persistent: true
      }).onOk(async () => {
        await removePage({ id: page.value.id })
      }).onOk(async () => {
        // console.log('>>>> second OK catcher')
        $q.notify(i18n.t('remove.confirm'))
        await router.replace('/admin/pages')
      }).onCancel(() => {
        // console.log('>>>> Cancel')
      }).onDismiss(() => {
        // console.log('I am triggered on both OK and Cancel')
      })
    }

    onMounted(() => {
      const { result, onResult } = contentsService.getPageById(id.value)

      if (id.value) {
        onResult(() => {
          const pageTemp = Object.assign({ ...result.value.pages_by_pk }) as Page
          pageTemp.createdAt = formatDate(result.value.pages_by_pk.createdAt)
          // console.log(pageTemp)
          page.value = pageTemp
        })
      } else {
        page.value = {
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
      page,
      upsertLoading,
      insertLoading,
      remove
    }
  }

}
</script>

<style>

</style>

<template>
    <translation-editor v-if="content" @guardar="guardar" :type="type" @remove="remove" @removeTag="removeTag" :loading="upsertLoading || insertLoading" :input-content="content"></translation-editor>
</template>

<script lang="ts">
import TranslationEditor from 'src/components/TranslationEditor/index.vue'
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { date, useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { cleanObject } from 'src/utilities/cleanObject'
import { ContentsService } from 'src/services/contents'
import { Content } from 'src/models/Content'

const formatDate = (inputDate: Date | string) => {
  return date.formatDate(inputDate, 'YYYY-MM-DD HH:mm')
}

export default {
  components: { TranslationEditor },
  name: 'EditContent',
  beforeRouteEnter (to, from, next) {
    // called before the route that renders this component is confirmed.
    // does NOT have access to `this` component instance,
    // because it has not been created yet when this guard is called!
    const allowedTypes = ['page', 'article', 'service', 'tag']
    if (allowedTypes.includes(to.params?.type as string)) {
      next()
    } else {
      next('/')
    }
  },
  setup () {
    const contentsService = new ContentsService()
    const route = useRoute()
    const router = useRouter()
    const i18n = useI18n()
    const $q = useQuasar()

    // Data
    const id = computed(() => Number(route.params?.id))
    const content = ref<Content>(null)
    const type = ref(route.params?.type as string)
    const { result, onResult, onError } = contentsService.getContentById(id.value, true)
    const { mutate: upsertContent, loading: upsertLoading } = contentsService.upsertContent()
    const { mutate: removeContent } = contentsService.deleteContent()
    const { mutate: insertContent, loading: insertLoading } = contentsService.insertContent()
    const { mutate: upsertContentTags } = contentsService.upsertContentTags()
    const { mutate: removeContentTagMutation } = contentsService.deleteContentTags()
    // Methods
    const guardar = async (obj) => {
      // console.log('obj', obj)
      const content = obj.content
      const translations = content.translations
      const tags = obj.tags
      cleanObject(translations)
      delete content.translations
      delete content.tags
      delete content.participants
      cleanObject(content)
      const variables = {
        content,
        translations
      }
      if (id.value) {
        await upsertContent(variables)
          .then(async () => {
            // update tags
            if (tags.length > 0) {
              const variables = {
                tags: tags.map(t => {
                  return {
                    content_id: id.value,
                    tag_id: t
                  }
                })
              }
              await upsertContentTags(variables)
            }
          })
          .then(() => {
            $q.notify(i18n.t('forms.savedOk'))
          })
          .catch(err => {
            console.error(err)
          })
      } else {
        variables.content.translations = {}
        variables.content.translations.data = variables.translations
        delete variables.translations
        await insertContent(variables)
          .then(res => {
            return res.data.insert_content_one.id
          })
          .then(async (id) => {
            // update tags
            if (tags.length > 0) {
              const variables = {
                tags: tags.map(t => {
                  return {
                    content_id: id,
                    tag_id: t
                  }
                })
              }
              await upsertContentTags(variables)
            }
          })
          .then(async () => {
            await router.replace(`/admin/${type.value}`)
          })
          .then(() => {
            $q.notify(i18n.t('forms.savedOk'))
          })
          .catch(err => {
            console.error(err)
          })
      }
    }

    const remove = (content) => {
      $q.dialog({
        title: i18n.t('remove.title'),
        message: i18n.t('remove.question'),
        cancel: true,
        persistent: true
      }).onOk(async () => {
        await removeContent({ id: content.value.id })
      }).onOk(async () => {
        // console.log('>>>> second OK catcher')
        $q.notify(i18n.t('remove.confirm'))
        await router.replace(`/admin/${type.value}`)
      }).onCancel(() => {
        // console.log('>>>> Cancel')
      }).onDismiss(() => {
        // console.log('I am triggered on both OK and Cancel')
      })
    }

    const removeTag = async (tag) => {
      const variables = {
        contentId: id.value,
        tagId: tag.value
      }
      await removeContentTagMutation(variables)
    }

    onMounted(() => {
      if (id.value) {
        onResult(() => {
          const contentTemp = Object.assign({ ...result.value?.content_by_pk }) as Content
          contentTemp.createdAt = formatDate(result.value?.content_by_pk.createdAt)
          // per si algú introdueix manualment una url amb un tipus que no es correspon amb el ID
          if (contentTemp.type) {
            type.value = contentTemp.type
          }
          // console.log(contentTemp)
          content.value = contentTemp
        })
      } else {
        content.value = {
          isPublished: false,
          createdAt: formatDate(new Date()),
          image: null,
          icon: 'las la-school',
          isMenu: false,
          type: type.value,
          tags: [],
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

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    onError(async () => {
      console.error(i18n.t('errorNetwork'))
      await router.push('/')
      // $q.notify({
      //   type: 'negative',
      //   message: `${i18n.t('errorNetwork')}? ${error}`
      // })
    })

    return {
      guardar,
      content,
      upsertLoading,
      insertLoading,
      remove,
      removeTag,
      type
    }
  }

}
</script>

<style>

</style>

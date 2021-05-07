<template>
  <transition
              appear
              enter-active-class="animated fadeInLeft"
              leave-active-class="animated fadeOutLeft">
    <q-page padding class="q-pa-md">
      <div v-if="loading">
        <q-skeleton type="text" height="60px" />
        <q-skeleton height="200px" square />
        <q-skeleton type="text" />
        <q-skeleton type="text" />
      </div>
      <div class="page" v-else-if="!page">
        404. Pàgina no trobada
      </div>
      <div class="page" v-else-if="page">
        <h1 class="text-h4 title">{{title}}</h1>
        <q-img
          fit="cover"
          v-if="page.image"
          :src="page.image">
        </q-img>
        <div class="content" v-html="content"></div>
      </div>
    </q-page>
  </transition>
</template>

<script lang="ts">
import { defineComponent, computed, watchEffect, ref } from 'vue'
import { useQuasar } from 'quasar'
import { ContentsService } from 'src/services/contents'
import { useRoute } from 'vue-router'
import { useStore } from 'src/services/store'
import { i18n } from 'src/boot/i18n'
import { Page } from 'src/models/Page'

export default defineComponent({
  name: 'NewsDetails',
  setup () {
    const contentsService = new ContentsService()
    const route = useRoute()
    const id = computed(() => Number(route.params.id))
    const store = useStore()
    const language = computed(() => store.state.settings.language)
    const page = ref<Page | null>(null)
    const title = computed(() => {
      if (page.value?.translations.find(t => t.language === language.value)?.title) {
        return page.value?.translations.find(t => t.language === language.value)?.title
      } else {
        return page.value?.translations.find(t => t.language === fallbackLanguage.value)?.title
      }
    })
    const content = computed(() => {
      if (page.value?.translations.find(t => t.language === language.value)?.content) {
        return page.value?.translations.find(t => t.language === language.value)?.content
      } else {
        return page.value?.translations.find(t => t.language === fallbackLanguage.value)?.content
      }
    })
    const fallbackLanguage = computed(() => store.state.settings.fallbackLanguage)

    const { result, loading, error, onResult } = contentsService.getPageById(id)

    onResult(() => {
      page.value = result.value.pages_by_pk
    })

    const translate = i18n.global

    watchEffect(
      () => {
        const $q = useQuasar()
        if (error.value) {
          console.error(translate.t('errorNetwork'))
          $q.notify({
            type: 'negative',
            message: translate.t('errorNetwork')
          })
        }
      }
    )
    return {
      page,
      loading,
      title,
      content
    }
  }
})
</script>
<style scoped lang="scss">
.text-h4 {
  margin-bottom: 0;
}
.subtitle {
  opacity: 0.6;
  margin-top: 0.5rem;
  margin-bottom: 1rem;
}
.updated {
  font-style: italic;
  font-size: 0.9em;
}
.content {
  margin-top: 1rem;
  text-align: justify;
  hyphens: auto;
}
.article {
  max-width: 600px;
  margin: auto auto;
}
</style>

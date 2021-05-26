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
      <div class="article" v-else-if="!content">
        404. No hem trobat el que buscaves
      </div>
      <div class="article" v-else-if="content">
        <h1 class="title">{{title}}</h1>
        <div class="subtitle" v-if="content.type === 'article'"><strong>{{formatedDate}}</strong>. <span class="updated" v-if="content.createdAt !== content.updatedAt">{{$t('updatedAt', {date: formatedUpdatedDate})}}</span></div>
          <div class="row">
            <div v-for="(t, index) in content.tags" :key="index">
              <q-chip dense clickable @click="$router.push(`/tag/${t.tag.id}/${t.tag.translations.find(tr => tr.language === $store.state.settings.language).slug}`)" color="accent" text-color="white" icon="las la-tag">
                {{t.tag.translations.find(tr => tr.language === $store.state.settings.language).title}}
              </q-chip>
            </div>
          </div>
        <q-img
          fit="cover"
          v-if="content.image"
          :src="content.image">
        </q-img>
        <div class="content" v-html="contentText"></div>
        <!-- is tag -->
        <div v-if="content.type === 'tag'">
          <div class="row items-start">
            <div
              class="col-12 col-sm-6 col-md-4 q-pa-sm"
              v-for="article in contentsList"
              :key="article.id"
            >
              <news-card :article="article"></news-card>
            </div>
          </div>
        </div>
      </div>
      <!-- is admin -->
      <q-page-sticky v-if="isAdmin" position="bottom-right" :offset="[18, 18]">
        <q-btn fab icon="las la-pencil-alt" color="primary" :to="`/admin/${content?.type}/edit/${content?.id}`" />
      </q-page-sticky>
    </q-page>
  </transition>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue'
import { date, useQuasar } from 'quasar'
import { useRoute, onBeforeRouteUpdate } from 'vue-router'
import { useStore } from 'src/services/store'
import { useI18n } from 'vue-i18n'
import { ContentsService } from 'src/services/contents'
import { Content } from 'src/models/Content'
import NewsCard from 'src/components/NewsCard.vue'

export default defineComponent({
  name: 'NewsDetails',
  components: { NewsCard },
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
    const id = computed(() => Number(route.params.id))
    const store = useStore()
    const $q = useQuasar()
    const i18n = useI18n()
    const isAdmin = computed(() => store.state.user.isAdmin)

    // Data
    const language = computed(() => store.state.settings.language)
    const fallbackLanguage = computed(() => store.state.settings.fallbackLanguage)
    const content = ref<Content>()
    const contentsList = ref<Content[]>(null)

    const { result, onResult, loading, error, onError, refetch } = contentsService.getContentById(id.value)

    const formatedDate = computed(() => date.formatDate(result.value?.content_by_pk?.createdAt, 'DD/MM/YYYY, HH:mm'))
    const formatedUpdatedDate = computed(() => date.formatDate(result.value?.content_by_pk?.updatedAt, 'DD/MM/YYYY, HH:mm'))

    const title = computed(() => {
      if (result.value?.content_by_pk?.translations.find(t => t.language === language.value)?.title) {
        return result.value?.content_by_pk?.translations.find(t => t.language === language.value)?.title
      } else {
        return result.value?.content_by_pk?.translations.find(t => t.language === fallbackLanguage.value)?.title
      }
    })
    const contentText = computed(() => {
      if (result.value?.content_by_pk?.translations.find(t => t.language === language.value)?.content) {
        return result.value?.content_by_pk?.translations.find(t => t.language === language.value)?.content
      } else {
        return result.value?.content_by_pk?.translations.find(t => t.language === fallbackLanguage.value)?.content
      }
    })

    // methods
    onResult(() => {
      content.value = result.value.content_by_pk
      if (result.value.content_by_pk.type === 'tag') {
        const { result: contentsByTagResult, onResult: onContentsByTagIdResult } = contentsService.getContentsByTagId(result.value.content_by_pk.id)
        onContentsByTagIdResult(() => {
          contentsList.value = contentsByTagResult.value?.content
        })
      }
    })

    onBeforeRouteUpdate(async (to, _) => {
      const id = to.params?.id.toString()
      const newVariables = { id }
      await refetch(newVariables)
    })

    onError(() => {
      console.error(i18n.t('errorNetwork'))
      $q.notify({
        type: 'negative',
        message: `${i18n.t('errorNetwork')}? ${error}`
      })
    })

    return {
      content,
      loading,
      title,
      formatedDate,
      formatedUpdatedDate,
      contentText,
      isAdmin,
      contentsList
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

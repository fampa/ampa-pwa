<template>
  <transition
              appear
              enter-active-class="animated fadeInLeft"
              leave-active-class="animated fadeOutLeft">
    <q-page padding class="q-pa-md bg-grey-2">
      <div v-if="loading">
        <q-skeleton type="text" height="60px" />
        <q-skeleton height="200px" square />
        <q-skeleton type="text" />
        <q-skeleton type="text" />
      </div>
      <div class="article bg-white" v-else-if="!content">
        <h1 class="title">Error 404</h1>
        <p>{{$t('error.404')}}</p>
        <q-btn color="primary" icon="home" to="/" :label="$t('backToHome')" />
      </div>
      <div class="article" :class="{'bg-white': content.type !== 'tag'}" v-else-if="content">
        <h1 class="title">{{fallbackContent(content, 'title')}}</h1>
        <div class="subtitle" v-if="content.type === 'article'"><strong>{{formatedDate}}</strong>. <span class="updated" v-if="showUpdate">{{$t('updatedAt', {date: formatedUpdatedDate})}}</span></div>
          <div class="row">
            <div v-for="(t, index) in content.tags" :key="index">
              <q-chip dense clickable @click="$router.push(`/tag/${t.tag.id}/${fallbackContent(t.tag, 'slug')}`)" color="accent" text-color="white" icon="las la-tag">
                {{fallbackContent(t.tag, 'title')}}
              </q-chip>
            </div>
          </div>
        <q-img
          fit="cover"
          v-if="content.image"
          :src="content.image">
        </q-img>
        <div class="content" v-html="fallbackContent(content, 'content')"></div>
        <!-- is tag -->
        <div v-if="content.type === 'tag'">
          <q-infinite-scroll @load="onLoad">
            <div class="row items-start">
              <div
                class="col-12 col-sm-6 col-md-6 q-pa-sm"
                v-for="article in contentsList"
                :key="article.id"
              >
                <news-card :article="article"></news-card>
              </div>
            </div>
           </q-infinite-scroll>
        </div>
        <!-- is service -->
        <div v-if="content.type === 'service'">
          <service-component @refetch="refetchContent" :service="content"></service-component>
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
import { defineComponent, computed, ref, reactive } from 'vue'
import { date } from 'quasar'
import { useRoute, useRouter, onBeforeRouteUpdate } from 'vue-router'
import { useStore } from 'src/services/store'
import { useI18n } from 'vue-i18n'
import { ContentsService } from 'src/services/contents'
import { Content } from 'src/models/Content'
import NewsCard from 'src/components/NewsCard.vue'
import ServiceComponent from 'src/components/ServiceComponent.vue'
import { fallbackContent } from 'src/utilities/fallbackContent'

export default defineComponent({
  name: 'NewsDetails',
  components: { NewsCard, ServiceComponent },
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
    const id = computed(() => Number(route.params.id))
    const store = useStore()
    // const $q = useQuasar()
    const i18n = useI18n()
    const isAdmin = computed(() => store.state.user.isAdmin)

    // Data
    const content = ref<Content>()
    const contentsList = ref<Content[]>(null)
    const showUpdate = ref<boolean>(false)
    const tagId = ref<number>(null)

    const data = reactive({
      page: 0,
      pageSize: 6
    })

    const { result, onResult, loading, onError, refetch } = contentsService.getContentById(id.value, isAdmin.value)

    const formatedDate = computed(() => date.formatDate(result.value?.content_by_pk?.createdAt, 'DD/MM/YYYY, HH:mm'))
    const formatedUpdatedDate = computed(() => date.formatDate(result.value?.content_by_pk?.updatedAt, 'DD/MM/YYYY, HH:mm'))
    const variables = ref({
      id: tagId.value,
      offset: data.page,
      limit: data.pageSize
    })
    const { result: contentsByTagResult, onResult: onContentsByTagIdResult, fetchMore: fetchMoreTags, refetch: refetchTags } = contentsService.getContentsByTagId({ ...variables.value, id: tagId.value })
    // methods
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    onResult(async () => {
      content.value = result.value?.content_by_pk
      const dif = date.getDateDiff(content.value?.updatedAt, content.value?.createdAt, 'hours')
      showUpdate.value = dif > 1
      if (content.value?.type === 'tag') {
        tagId.value = content.value?.id
        await refetchTags({ ...variables.value, id: content.value?.id })
      }
    })

    onContentsByTagIdResult(() => {
      if (content.value?.type === 'tag') {
        contentsList.value = contentsByTagResult.value?.content
        tagId.value = result.value?.content_by_pk?.id
      }
    })

    const refetchContent = async () => {
      await refetch()
    }

    const onLoad = async (_, done) => {
      // console.log('onLoad')
      data.page++

      await fetchMoreTags({
        variables: {
          offset: (data.page * data.pageSize)
        }
      })
        .then(res => {
          const moreContent = res.data?.content
          if (moreContent?.length === 0) {
            done(true)
          } else {
            done()
          }
        })
    }

    onBeforeRouteUpdate(async (to, _) => {
      const id = to.params?.id.toString()
      const newVariables = { id }
      await refetch(newVariables)
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
      content,
      loading,
      formatedDate,
      formatedUpdatedDate,
      isAdmin,
      contentsList,
      refetchContent,
      fallbackContent,
      showUpdate,
      onLoad
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
  max-width: 650px;
  margin: auto auto;
  padding: 2rem;
  border-radius: 15px;
}
</style>

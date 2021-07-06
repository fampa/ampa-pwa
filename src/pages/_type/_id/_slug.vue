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
        <div class="row">
          <div v-for="(t, index) in content.tags" :key="index">
            <q-chip dense clickable @click="$router.push(`/tag/${t.tag.id}/${fallbackContent(t.tag, 'slug')}`)" color="accent" text-color="white" icon="las la-tag">
              {{fallbackContent(t.tag, 'title')}}
            </q-chip>
          </div>
        </div>
        <h1 class="title">{{fallbackContent(content, 'title')}}</h1>
        <div class="subtitle" v-if="content.type === 'article'">
          <strong>{{formatedDate}}</strong>. <br> <span class="updated" v-if="showUpdate">{{$t('updatedAt', {date: formatedUpdatedDate})}}</span>
        </div>
        <q-img
          fit="cover"
          v-if="content.image"
          :src="content.image">
        </q-img>
        <div class="content" v-html="fallbackContent(content, 'content')"></div>

        <!-- is article -->
        <div v-if="content.type === 'article'" class="content share-network-list">
          <ShareNetwork
          v-for="network in networks"
          :key="network.network"
          :network="network.network"
          :url="mainUrl + $route.fullPath"
          :title="fallbackContent(content, 'title')"
            hashtags="ampa"
        >
          <q-btn :style="`background: ${network.color}; color: white; margin: 0.5rem 0;`" :icon="network.icon" :label="network.name" />
        </ShareNetwork>
        </div>

        <!-- is tag -->
        <div v-if="content.type === 'tag'">
            <div class="row items-start">
              <div
                class="col-12 col-sm-6 col-md-6 q-pa-sm"
                v-for="article in cleanArticles"
                :key="article.id"
              >
                <news-card :article="article"></news-card>
              </div>
            </div>
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
import { defineComponent, computed, ref, reactive, toRefs } from 'vue'
import { date, useMeta } from 'quasar'
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
    const allowedTypes = ['page', 'article', 'blog', 'service', 'tag']
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
    const mainUrl = process.env.MAIN_URL
    const isAdmin = computed(() => store.state.user.isAdmin)
    const networks = [
      {
        network: 'email',
        name: 'Email',
        icon: 'las la-envelope',
        color: '#333333'
      },
      {
        network: 'facebook',
        name: 'Facebook',
        icon: 'lab la-facebook',
        color: '#3B5998'
      },

      {
        network: 'telegram',
        name: 'Telegram',
        icon: 'lab la-telegram',
        color: '#0088cc'
      },
      {
        network: 'twitter',
        name: 'Twitter',
        icon: 'lab la-twitter',
        color: '#1da1f2'
      },
      {
        network: 'whatsapp',
        name: 'Whatsapp',
        icon: 'lab la-whatsapp',
        color: '#25d366'
      }
    ]

    // Data
    const content = ref<Content>()
    const contentsList = ref<Content[]>(null)
    const showUpdate = ref<boolean>(false)
    const tagId = ref<number>(null)
    // const type = computed(() => route.params?.type)

    const data = reactive({
      page: 1,
      pageSize: 6,
      pages: 5
    })

    const { result, onResult, loading, onError, refetch } = contentsService.getContentById(id.value, isAdmin.value)

    const formatedDate = computed(() => date.formatDate(result.value?.content_by_pk?.createdAt, 'DD/MM/YYYY, HH:mm'))
    const formatedUpdatedDate = computed(() => date.formatDate(result.value?.content_by_pk?.updatedAt, 'DD/MM/YYYY, HH:mm'))
    const variables = ref({
      id: tagId.value,
      offset: data.page - 1,
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

    const metaData = ref({
      // sets document title
      title: fallbackContent(content?.value, 'title'),
      // optional; sets final title as "Index Page - My Website", useful for multiple level meta
      titleTemplate: title => `${title} - AMPA`,
      // meta tags
      meta: {
        description: { name: 'description', content: `${fallbackContent(content.value, 'title')}` },
        ogTitle: { name: 'og:title', content: `${fallbackContent(content.value, 'title')} - AMPA` },
        ogDescription: { name: 'og:description', content: `${fallbackContent(content.value, 'title')}` },
        ogUrl: {
          name: 'og:url',
          content: `${mainUrl}${route?.fullPath}`
        },
        ogImage: {
          name: 'og:image',
          content: content.value?.image
        },
        ogType: { name: 'og:type', content: 'website' },
        twitterCard: {
          property: 'twitter:card',
          content: 'summary_large_image'
        },
        twitterTitle: {
          property: 'twitter:title',
          content: `${fallbackContent(content.value, 'title')} - AMPA`
        },
        twitterDescription: {
          property: 'twitter:description',
          content: `${fallbackContent(content.value, 'title')}`
        },
        twitterImage: {
          property: 'twitter:image',
          content: `${content.value?.image}`
        }
      }
    })

    useMeta(metaData.value)

    onContentsByTagIdResult(() => {
      if (content.value?.type === 'tag') {
        contentsList.value = contentsByTagResult.value?.content
        const pages = contentsByTagResult.value?.content_aggregate?.aggregate?.count / data.pageSize
        // TODO implement pagination
        data.pages = Math.ceil(pages)
        tagId.value = result.value?.content_by_pk?.id
      }
    })

    // This is a bit of a hack but we need to manually remove duplicated results due to this issue: https://github.com/apollographql/apollo-client/issues/6916
    const cleanArticles = computed(() => {
      const array = contentsList.value
      const articlesOutput = array?.filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i)
      return articlesOutput
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
      ...toRefs(data),
      content,
      loading,
      formatedDate,
      formatedUpdatedDate,
      isAdmin,
      cleanArticles,
      refetchContent,
      fallbackContent,
      showUpdate,
      onLoad,
      networks,
      mainUrl
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
.share-network-list * {
  margin-right: 1rem;
  color: white;
  font-size: 0.8rem;
}
</style>

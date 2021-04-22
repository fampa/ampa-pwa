<template>
<transition
            appear
            enter-active-class="animated fadeOutLeft"
            leave-active-class="animated fadeInRight">
  <q-page class="bg-grey-2 q-pa-md">
    <div v-if="loading">
      <div class="row items-start">
        <div
          class="col-12 col-sm-6 col-md-4 q-pa-sm"
          v-for="(item, index) in [1, 2, 3, 4, 5, 6]"
          :key="index"
        >
          <q-card class="news-card">
            <q-skeleton height="200px" square />
            <q-card-section>
              <div class="text-h6 title">
                <q-skeleton type="text" />
              </div>
              <div class="text-subtitle2">
                <q-skeleton type="text" />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
    <div v-else-if="articles">
      <q-infinite-scroll :offset="100" @load="onLoad">
        <div class="row items-start">
          <div
            class="col-12 col-sm-6 col-md-4 q-pa-sm"
            v-for="article in articles"
            :key="article.id"
          >
            <news-card :article="article"></news-card>
          </div>
        </div>
        <template v-if="loading" v-slot:loading>
          <div class="row justify-center q-my-md">
            <q-spinner-dots color="primary" size="40px" />
          </div>
        </template>
      </q-infinite-scroll>
    </div>
  </q-page>
</transition>
</template>

<script lang="ts">
import { defineComponent, watchEffect, reactive, ref } from 'vue'
// import { useStore } from 'src/services/store'
import NewsCard from 'components/NewsCard.vue'
import { ArticlesService } from 'src/services/articles'
import { Article } from '@/models/Article'
// import { useQuasar } from 'quasar'
// import { i18n } from 'src/boot/i18n'

export default defineComponent({
  name: 'PageIndex',
  components: { NewsCard },
  setup () {
    const articlesService = new ArticlesService()
    // const store = useStore()

    // const translate = i18n.global

    const data = reactive({
      page: 0,
      pageSize: 6
    })

    const loading = ref<boolean>(false)
    const error = ref<unknown>(null)
    const articles = ref<Article[]>([])

    const result = articlesService.getAll(data.page, data.pageSize)

    const onLoad = () => {
      // console.log('onLoad')
      data.page++
      /* await fetchMore({
        variables: {
          offset: (data.page * data.pageSize)
        }
      }) */
    }

    watchEffect(() => {
      // console.log(articles)
      loading.value = result.fetching.value
      error.value = result.error.value
      articles.value = result.data.value?.articles as Article[]
      /* if (error.value) {
        console.error(error, translate.t('errorNetwork'))
        // const $q = useQuasar()
        // $q.notify({
        //   type: 'negative',
        //   message: translate.t('errorNetwork')
        // })
      } */
    })

    return {
      articles,
      loading,
      onLoad
    }
  }
})
</script>

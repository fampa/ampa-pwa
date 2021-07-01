<template>
<transition
            appear
            enter-active-class="animated fadeOutLeft"
            leave-active-class="animated fadeInRight">
  <q-page class="bg-grey-2 q-pa-md">
    <div v-if="!articles && loading">
      <div class="row items-start">
        <div
          class="col-12 col-sm-6 col-md-4 q-pa-sm"
          v-for="(item, index) in 6"
          :key="index"
          :class="{'col-md-6': index === 0 || index === 1, 'col-sm-12': index === 0 }"
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
      <q-infinite-scroll @load="onLoad">
        <div class="row items-start">
          <div
            class="col-12 col-sm-6 col-md-4 q-pa-sm"
            v-for="(article, index) in articles"
            :key="article.id"
            :class="{'col-md-6': index === 0 || index === 1, 'col-sm-12': index === 0 }"
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
import { defineComponent, reactive, ref } from 'vue'
// import { useStore } from 'src/services/store'
import NewsCard from 'components/NewsCard.vue'
// import { useQuasar } from 'quasar'
import { ContentsService } from 'src/services/contents'
import { Content } from 'src/models/Content'
// import { useI18n } from 'vue-i18n'

export default defineComponent({
  name: 'PageIndex',
  components: { NewsCard },
  setup () {
    const contentsService = new ContentsService()
    const articles = ref<Content[]>([])
    // const store = useStore()
    // const $q = useQuasar()
    // const i18n = useI18n()

    const data = reactive({
      page: 0,
      pageSize: 6
    })

    const { result, loading, error, fetchMore, onResult, onError } = contentsService.getContentsFrontPage({ offset: data.page, limit: data.pageSize })

    onResult(() => {
      if (result.value?.content?.length > 0) {
        articles.value = [...result.value?.content]
      }
    })

    const onLoad = async (_, done) => {
      // console.log('onLoad')
      data.page++

      await fetchMore({
        variables: {
          offset: (data.page * data.pageSize)
        }
      })
        .then(res => {
          const moreContent = res.data.content
          if (moreContent?.length === 0) {
            done(true)
          } else {
            done()
          }
        })
    }

    onError(() => {
      console.error(error.value.message)
      // $q.notify({
      //   type: 'negative',
      //   message: error.value.message
      // })
    })

    return {
      articles,
      loading,
      onLoad
    }
  }
})
</script>

<style lang="scss">
.items-start > .card-holder {
  width: 50%;
}

</style>

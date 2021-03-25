<template>
  <q-page class="bg-grey-2 q-pa-md">
    <div v-if="loading">
      <div class="row items-start">
        <div class="col-12 col-sm-6 col-md-4 q-pa-sm" v-for="(item, index) in [1,2,3,4,5,6]" :key="index">
          <q-card class="news-card">
            <q-skeleton height="200px" square />
            <q-card-section>
              <div class="text-h6 titular">
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
      <div class="row items-start">
        <div class="col-12 col-sm-6 col-md-4 q-pa-sm" v-for="article in articles" :key="article.id">
          <news-card :article="article"></news-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, watchEffect } from 'vue'
// import { useStore } from 'src/services/store'
import NewsCard from 'components/NewsCard.vue'
import { ArticlesService } from 'src/services/articles'
import { useQuasar } from 'quasar'
import { i18n } from 'src/boot/i18n'

export default defineComponent({
  name: 'PageIndex',
  components: { NewsCard },
  setup () {
    const articlesService = new ArticlesService()
    // const store = useStore()
    const $q = useQuasar()
    const translate = i18n.global
    const { articles, loading, error } = articlesService.getAll()
    watchEffect(
      () => {
        if (error.value) {
          console.log(error)
          $q.notify({
            type: 'negative',
            message: translate.t('errorNetwork')
          })
        }
      }
    )
    return {
      articles,
      loading,
      error
    }
  }
})
</script>

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
    <div v-else-if="error">
      {{error}}
    </div>
    <div v-else-if="articles">
      <div class="row items-start">
        <div class="col-12 col-sm-6 col-md-4 q-pa-sm" v-for="article in articles" :key="article.id">
          <news-card :article="article" :language="language"></news-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useStore } from 'src/services/store'
import NewsCard from 'components/NewsCard.vue'
import { ArticlesService } from 'src/services/articles'

export default defineComponent({
  name: 'PageIndex',
  components: { NewsCard },
  setup () {
    const articlesService = new ArticlesService()
    const store = useStore()
    const language = computed(() => store.state.settings.language)
    const { articles, loading, error } = articlesService.getAll()
    return {
      articles,
      loading,
      error,
      language
    }
  }
})
</script>

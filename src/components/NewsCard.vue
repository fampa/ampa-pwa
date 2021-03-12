<template>
    <q-card class="news-card">
      <q-img
        v-if="article.image"
        :src="article.image"
        style="height: 200px;"
        fit="cover"
      />
      <q-card-section>
        <div class="text-h6">
          {{
            article.translations.find(t=>t.language === language)?.title ?
            article.translations.find(t=>t.language === language)?.title :
            article.translations.find(t=>t.language === fallbackLanguage)?.title
          }}
        </div>
        <div class="text-subtitle2">{{date.formatDate(article.created_at, 'DD-MM-YYYY')}}</div>
      </q-card-section>
    </q-card>
</template>

<script lang="ts">
import { defineComponent, PropType, toRefs } from 'vue'
import { Article } from '@/models/Article'
import { date } from 'quasar'

export default defineComponent({
  name: 'NewsCard',
  props: {
    article: {
      type: Object as PropType<Article>,
      required: true
    },
    language: {
      type: String,
      default: 'ca'
    },
    fallbackLanguage: {
      type: String,
      default: 'es'
    }
  },
  setup (props) {
    return { ...toRefs(props), date }
  }
})
</script>

<style lang="scss" scoped>

</style>

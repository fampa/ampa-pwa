<template>
    <q-card class="news-card">
      <q-img
        :src="article.image"
        class="image-placeholder"
        fit="cover"
      >
      </q-img>
      <q-card-section>
        <div class="text-h6 titular">
          {{
            article.translations.find(t=>t.language === language)?.title ?
            article.translations.find(t=>t.language === language)?.title :
            article.translations.find(t=>t.language === fallbackLanguage)?.title
          }}
          <q-tooltip>
            {{
              article.translations.find(t=>t.language === language)?.title ?
              article.translations.find(t=>t.language === language)?.title :
              article.translations.find(t=>t.language === fallbackLanguage)?.title
            }}
          </q-tooltip>
        </div>
        <div class="text-subtitle2">{{date.formatDate(article.created_at, 'DD/MM/YYYY')}}</div>
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
.image-placeholder {
  height: 200px;
  background: linear-gradient($primary, $accent);
}
.titular {
  display: inline-block;
  height: 65px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  text-overflow: ellipsis;
}
</style>

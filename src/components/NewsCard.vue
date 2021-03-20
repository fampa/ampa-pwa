<template>
    <q-card class="news-card">
      <div class="img-container">
        <q-img
          :src="article.image"
          class="image-placeholder"
          fit="cover"
        ></q-img>
      </div>
      <q-card-section class="card-section">
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
import { defineComponent, PropType, toRefs, computed } from 'vue'
import { Article } from '@/models/Article'
import { date } from 'quasar'
import { useStore } from 'src/services/store'

export default defineComponent({
  name: 'NewsCard',
  props: {
    article: {
      type: Object as PropType<Article>,
      required: true
    }
  },
  setup (props) {
    const store = useStore()
    const language = computed(() => store.state.settings.language)
    const fallbackLanguage = computed(() => store.state.settings.fallbackLanguage)
    return { ...toRefs(props), date, language, fallbackLanguage }
  }
})
</script>

<style lang="scss" scoped>
.img-container {
  overflow: hidden;
}
.image-placeholder {
  height: 200px;
  background: linear-gradient($primary, $accent);
  transition: transform 0.3s ease-in-out;
}
.image-placeholder:hover {
  transform: scale(1.2);
  transition: transform 0.3s ease-in-out;
}
.titular {
  height: 65px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  text-overflow: ellipsis;
}
</style>

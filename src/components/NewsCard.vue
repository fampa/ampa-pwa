<template>
    <div>
        News card {{article.id}} <br>
        Status: {{article.status}} <br>
        Date: {{ article.created_at }} <br>
        Title: {{
          article.translations.find(t=>t.language === language)?.title ?
          article.translations.find(t=>t.language === language)?.title :
          article.translations.find(t=>t.language === fallbackLanguage)?.title
        }}
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType, toRefs } from 'vue'
import { Article } from '@/models/Article'

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
    return { ...toRefs(props) }
  }
})
</script>

<style lang="scss" scoped>

</style>

<template>
    <div>
        News card {{article.id}}
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { Article } from '@/models/Article'

export default defineComponent({
  name: 'NewsCard',
  props: {
    article: {
      type: Object as PropType<Article>,
      required: true
    }
  },
  setup (props) {
    return { props }
  }
})
</script>

<style lang="scss" scoped>

</style>

<template>
  <q-page padding>
    Article
    {{ result }}
    {{ error }}
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { ArticlesService } from 'src/services/articles'
import { useRoute } from 'vue-router'

export default defineComponent({
  name: 'NewsDetails',
  setup () {
    const articlesService = new ArticlesService()
    const route = useRoute()
    const id = Number(route.params.id)
    console.log(id)

    const { result, loading, error } = articlesService.getById(id)

    // watch(
    //   () => route.params,
    //   newParams => {
    //     console.log(newParams)
    //     const { result, loading, error } = articlesService.getById(Number(newParams.id))
    //     article.value = result.value
    //     articleLoading.value = loading.value
    //     articleError.value = error.value
    //   }
    // )

    return {
      result,
      loading,
      error
    }
  }
})
</script>

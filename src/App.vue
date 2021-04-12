<template>
  <router-view />
</template>
<script lang="ts">
import { defineComponent, provide } from 'vue'
import { DefaultApolloClient } from '@vue/apollo-composable'
import { apolloClient } from 'src/boot/apollo'
// import { ArticlesService } from 'src/services/articles'

export default defineComponent({
  name: 'App',
  setup () {
    provide(DefaultApolloClient, apolloClient)

    // onUnmounted(async () => {
    //   const articlesService = new ArticlesService()
    //   await articlesService.clearCache()
    // })
  }
})
</script>

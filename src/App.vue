<template>
  <router-view />
</template>
<script lang="ts">
import { defineComponent, onUnmounted } from 'vue'
import { provideApolloClient } from '@vue/apollo-composable'
import { apolloClient } from 'src/boot/apollo'
import { ArticlesService } from 'src/services/articles'

export default defineComponent({
  name: 'App',
  setup () {
    // provide(DefaultApolloClient, apolloClient)
    provideApolloClient(apolloClient)

    onUnmounted(async () => {
      const articlesService = new ArticlesService()
      await articlesService.clearCache()
    })
  }
})
</script>

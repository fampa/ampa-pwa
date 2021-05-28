<template>
  <router-view />
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { provideApolloClient } from '@vue/apollo-composable'
import { apolloClient } from 'src/boot/apollo'

export default defineComponent({
  name: 'App',
  setup () {
    // provide(DefaultApolloClient, apolloClient)
    provideApolloClient(apolloClient)
  }
})
</script>

<template>
  <router-view />
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { provideClient } from '@urql/vue'
import { client } from 'src/boot/urql'

export default defineComponent({
  name: 'App',
  setup () {
    provideClient(client)
  }
})
</script>

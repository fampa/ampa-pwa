<template>
  <q-page padding class="bg-grey-2">
    <h1 class="text-h4">{{$t('personalData')}}</h1>
  </q-page>
</template>

<script lang="ts">
import { useStore } from 'src/services/store'
export default {
  name: 'PagePersonalData',
  setup () {
    const store = useStore()

    const setLanguage = async (lang: string) => {
      await store.dispatch('settings/setLanguage', lang)
    }

    return {
      setLanguage
    }
  }
}
</script>

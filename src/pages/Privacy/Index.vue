<template>
  <q-page padding class="bg-grey-2  q-pa-md">
    <h1 class="title">{{$t('privacy.title')}}</h1>
    <div v-html="$t('privacy.content')"></div>
  </q-page>
</template>

<script lang="ts">
export default {
  name: 'Privacy'

}
</script>

<style>

</style>

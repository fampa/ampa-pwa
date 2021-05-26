<template>
    <q-page padding class="bg-grey-2  q-pa-md">
    <h1 class="title">{{$t('terms.title')}}</h1>
    <div v-html="$t('terms.content')"></div>
    </q-page>
</template>

<script lang="ts">
export default {
  name: 'TES'

}
</script>

<style>

</style>

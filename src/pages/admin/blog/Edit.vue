<template>
    <article-editor @guardar="guardar"></article-editor>
</template>

<script lang="ts">
import ArticleEditor from 'src/components/ArticleEditor/index.vue'

export default {
  components: { ArticleEditor },
  setup () {
    const guardar = (val) => {
      console.log('guardat', val)
    }

    return {
      guardar
    }
  }

}
</script>

<style>

</style>

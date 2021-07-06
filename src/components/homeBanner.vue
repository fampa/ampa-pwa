<template>
  <router-link class="card" :to="`/login`">
    <q-card class="bg-accent text-white" v-ripple>
      <q-item>
         <q-item-section avatar>
          <q-avatar>
            <img :src="'icons/favicon-96x96.png'">
          </q-avatar>
        </q-item-section>
        <q-item-section>
          <div class="text-white text-h6" v-html="$t('homePage.banner')"></div>
        </q-item-section>
      </q-item>
    </q-card>
  </router-link>
</template>

<script lang="ts">
export default {
  name: 'Home banner',
  setup () {
    return {
    }
  }
}
</script>

<style lang="scss">
</style>

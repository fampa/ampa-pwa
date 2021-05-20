<template>
  <q-page padding class="bg-grey-2  q-pa-md">
    <h1 class="text-h4">{{$t('settings')}}</h1>
      <q-list bordered padding class="bg-white">
        <q-item-label header>{{$t('settingsPage.general')}}</q-item-label>

        <q-item clickable v-ripple>
          <q-item-section avatar>
            <q-icon name="las la-language"></q-icon>
          </q-item-section>
          <q-item-section>
            <q-item-label>{{$t('settingsPage.language')}}</q-item-label>
            <q-item-label caption>
              {{$store.state.settings.language}}
            </q-item-label>
          </q-item-section>
          <q-menu>
            <q-list style="min-width: 100px">
              <q-item clickable v-close-popup @click="setLanguage('ca')">
                <q-item-section>Català/Valencià</q-item-section>
              </q-item>
              <q-item clickable v-close-popup  @click="setLanguage('es')">
                <q-item-section>Español</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-item>

        <q-separator />

        <q-item-label header>{{$t('settingsPage.notifications')}}</q-item-label>
        <q-item>
          <q-item-section avatar>
            <q-icon name="las la-sms"></q-icon>
          </q-item-section>
          WIP
            <!-- <push-toggle :label="$t('settingsPage.push')" @childState="onChildEmit" @pushToken="pushChange" /> -->
        </q-item>
      </q-list>
  </q-page>
</template>

<script lang="ts">
import { useStore } from 'src/services/store'
export default {
  name: 'PageSettings',
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

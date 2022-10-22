<template>
  <q-page padding class="bg-grey-2 q-pa-md">
    <h1 class="text-h4">{{ $t("settings.title") }}</h1>
    <q-list bordered padding class="bg-white">
      <q-item-label header>{{ $t("settings.general") }}</q-item-label>

      <q-item clickable v-ripple>
        <q-item-section avatar>
          <q-icon name="las la-language"></q-icon>
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ $t("settings.language") }}</q-item-label>
          <q-item-label caption>
            {{ $store.state.settings.language }}
          </q-item-label>
        </q-item-section>
        <q-menu>
          <q-list style="min-width: 100px">
            <q-item
              v-for="(lang, index) in availableLocales"
              :key="index"
              clickable
              v-close-popup
              @click="setLanguage(lang.value)"
            >
              <q-item-section>{{ lang.label }}</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-item>

      <q-separator />

      <q-item-label header>{{ $t("settings.notifications") }}</q-item-label>
      <q-item  v-if="!member">
        <q-item-label>({{ $t("member.needLogin") }}: <router-link :to="`/login?next=${$route.path}`">{{$t('login')}}</router-link>)</q-item-label>
      </q-item>
      <q-item>
        <q-item-section avatar>
          <q-icon name="las la-envelope"></q-icon>
        </q-item-section>
        <q-item-section>
          <q-item-label>
            <q-toggle :label="$t('settings.email')" :disable="!member" v-model="canEmail" @update:model-value="setCanEmail" />
          </q-item-label>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section avatar>
          <q-icon name="las la-sms"></q-icon>
        </q-item-section>
        <q-item-section>
          <q-item-label v-if="notificationSupported">
            <push-toggle :label="$t('settings.push.title')"  />
          </q-item-label>
          <q-item-label v-else>
            <q-btn flat :label="$t('settings.push.notSupported')" :disable="true" />
          </q-item-label>
          <q-item-label caption>
            {{ $t("settings.push.deviceSpecific") }}
          </q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </q-page>
</template>

<script lang="ts">
import { useStore } from 'src/services/store'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { MembersService } from 'src/services/members'
import PushToggle from 'src/components/PushToggle.vue'

export default {
  name: 'PageSettings',
  components: { PushToggle },
  setup () {
    const store = useStore()
    const i18n = useI18n()
    const membersService = new MembersService()
    const notificationSupported = ('Notification' in window)

    const { mutate: mutateMember } = membersService.updateMember()

    // data
    const member = computed(() => store.state.user.member)
    const canEmail = ref<boolean>(member.value?.canEmail)
    const availableLocales = i18n.availableLocales.map((l) => {
      return {
        label: i18n.t(l),
        value: l
      }
    })

    const setLanguage = async (lang: string) => {
      await store.dispatch('settings/setLanguage', lang)
    }

    const setCanEmail = async () => {
      await mutateMember({ id: member.value?.id, member: { canEmail: canEmail.value } })
        .then(async () => {
          await store.dispatch('user/setMember', member.value?.id)
        })
    }

    // gets the value even if you recently logged in
    watch(() => member.value,
      () => {
        canEmail.value = member.value?.canEmail
      }
    )

    return {
      setLanguage,
      member,
      availableLocales,
      canEmail,
      setCanEmail,
      notificationSupported
    }
  }
}
</script>

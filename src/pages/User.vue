<template>
  <q-page padding class="bg-grey-2">
    <h1 class="text-h4">{{$t('personalData')}}</h1>
    <div class="q-gutter-md" style="max-width: 300px" v-if="member">
      <q-input outlined v-model="firstName" :label="$t('member.firstName')" :rules="[val => !!val || $t('forms.required')]" />
      <q-input outlined v-model="lastName" :label="$t('member.lastName')" :rules="[val => !!val || $t('forms.required')]" />
      <q-input outlined v-model="email" :label="$t('member.email')" />
      <q-input outlined v-model="phone" :label="$t('member.phone')" />
    </div>
  </q-page>
</template>

<script lang="ts">
import { useRoute } from 'vue-router'
import { MembersService } from 'src/services/members'
import { computed, ref, watchEffect } from 'vue'
import firebase from 'firebase/app'
import 'firebase/auth'

export default {
  name: 'PagePersonalData',
  setup () {
    const firstName = ref<string | undefined>('')
    const lastName = ref<string | undefined>('')
    const email = ref<string | undefined>('')
    const phone = ref<string | undefined>('')

    const currentUserId = computed(() => {
      return firebase.auth().currentUser?.uid
    })

    const membersService = new MembersService()
    const route = useRoute()
    const id = computed(() => {
      const params = route.params?.id?.toString()
      if (params) {
        return params
      } else {
        return currentUserId.value || ''
      }
    })

    const { member, loading, error } = membersService.getById(id.value)

    watchEffect(() => {
      firstName.value = member.value?.firstName
      lastName.value = member.value?.lastName
      email.value = member.value?.email
      phone.value = member.value?.phone
    })

    return {
      member,
      firstName,
      lastName,
      email,
      phone,
      loading,
      error
    }
  }
}
</script>

<template>
  <q-page padding class="bg-grey-2">
    <h1 class="text-h4">{{$t('personalData')}}</h1>
    <div class="q-gutter-md" style="max-width: 300px" v-if="member">
      <q-form ref="memberForm" @submit.prevent="submitForm">
        <q-input outlined v-model="firstName" :label="$t('member.firstName')" :rules="[val => !!val || $t('forms.required')]" />
        <q-input outlined v-model="lastName" :label="$t('member.lastName')" :rules="[val => !!val || $t('forms.required')]" />
        <q-input outlined v-model="nif" label="NIF o NIE" :rules="[val => !!val || $t('forms.required'), val => !!validateNif(val) || $t('forms.validNif')]" />
        <q-input outlined v-model="email" type="email" :label="$t('member.email')" :rules="[val => !!val || $t('forms.required'), val => !!emailPattern.test(val) || $t('forms.validEmail')]" />
        <q-input outlined v-model="phone" type="tel" :label="$t('member.phone')" :rules="[val => !!val || $t('forms.required'), val => !!phonePattern.test(val) || $t('forms.validPhone')]" />
      </q-form>
    </div>
  </q-page>
</template>

<script lang="ts">
import { useRoute } from 'vue-router'
import { MembersService } from 'src/services/members'
import { computed, ref, watchEffect } from 'vue'
import firebase from 'firebase/app'
import 'firebase/auth'
import { validateSpanishId } from 'spain-id'

export default {
  name: 'PagePersonalData',
  setup () {
    const firstName = ref<string | undefined>('')
    const lastName = ref<string | undefined>('')
    const nif = ref<string | undefined>('')
    const email = ref<string | undefined>('')
    const phone = ref<string | undefined>('')

    const emailPattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/

    const phonePattern = /(6|7|9)\d{8}$/

    const validateNif = (nif) => validateSpanishId(nif) as boolean

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
      nif.value = member.value?.nif
    })

    const memberForm = ref<HTMLFormElement | null>(null)

    const submitForm = (): void => {
      memberForm.value?.validate().then(success => {
        if (success) {
          // yay, models are correct
          console.log('form submitted')
        } else {
          // oh no, user has filled in
          // at least one invalid value
        }
      })
    }

    return {
      member,
      firstName,
      lastName,
      email,
      phone,
      nif,
      loading,
      error,
      submitForm,
      emailPattern,
      phonePattern,
      validateNif
    }
  }
}
</script>
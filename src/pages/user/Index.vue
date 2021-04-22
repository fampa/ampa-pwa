<template>
  <q-page padding class="bg-grey-2">
    <h1 class="text-h4">{{$t('personalData')}}</h1>
    <div class="q-gutter-md" style="max-width: 300px">
      <q-form ref="memberForm" @submit.prevent="submitForm">
        <q-input outlined v-model="firstName" :label="$t('member.firstName')" :rules="[val => !!val || $t('forms.required')]" />
        <q-input outlined v-model="lastName" :label="$t('member.lastName')" :rules="[val => !!val || $t('forms.required')]" />
        <q-input outlined v-model="nif" label="NIF o NIE" :rules="[val => !!val || $t('forms.required'), val => !!validateNif(val) || $t('forms.validNif')]" />
        <q-input outlined v-model="email" type="email" :label="$t('member.email')" :rules="[val => !!val || $t('forms.required'), val => !!emailPattern.test(val) || $t('forms.validEmail')]" />
        <q-input outlined v-model="phone" type="tel" :label="$t('member.phone')" :rules="[val => !!val || $t('forms.required'), val => !!phonePattern.test(val) || $t('forms.validPhone')]" />
        <q-btn color="primary" :label="$t('forms.save')" type="submit" />
      </q-form>
    </div>
  </q-page>
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { useRoute } from 'vue-router'
import { MembersService } from 'src/services/members'
import { computed, ref, reactive, toRefs, onMounted } from 'vue'
import firebase from 'firebase/app'
import 'firebase/auth'
import { validateSpanishId } from 'spain-id'
// import { useQuasar } from 'quasar'

export default {
  name: 'PagePersonalData',
  setup () {
    // const $q = useQuasar()
    // $q.notify('success')
    const data = reactive({
      id: '',
      firstName: '',
      lastName: '',
      nif: '',
      email: '',
      phone: ''
    })

    const emailPattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/

    const phonePattern = /(6|7|9)\d{8}$/

    const validateNif = (nif) => validateSpanishId(nif) as boolean

    const currentUserId = computed(() => {
      return firebase.auth().currentUser?.uid
    })

    const memberForm = ref<HTMLFormElement | null>(null)

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

    onMounted(async () => {
      const result = await membersService.getById(id.value)
      const dataBase = result.data?.members_by_pk
      data.id = dataBase?.id || ''
      data.firstName = dataBase?.firstName || data.firstName
      data.lastName = dataBase?.lastName || data.lastName
      data.nif = dataBase?.nif || ''
      data.email = dataBase?.email || ''
      data.phone = dataBase?.phone || ''
    })

    const { executeMutation } = membersService.updateMember()
    const submitForm = async () => {
      await memberForm.value?.validate().then(async (success) => {
        if (success) {
          // yay, models are correct
          await executeMutation({ ...data })
          console.log('success')
        } else {
          // oh no, user has filled in
          // at least one invalid value
        }
      })
    }

    return {
      ...toRefs(data),
      submitForm,
      emailPattern,
      phonePattern,
      validateNif,
      memberForm
    }
  }
}
</script>

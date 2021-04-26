<template>
  <q-page padding class="bg-grey-2">
    <h1 class="text-h4">{{$t('personalData')}}</h1>
    <div class="q-gutter-md" style="max-width: 300px" v-if="id">
      <q-form ref="memberForm" @submit.prevent="submitForm">
        <q-input outlined v-model="firstName" :label="$t('member.firstName')" :rules="[val => !!val || $t('forms.required')]" />
        <q-input outlined v-model="lastName" :label="$t('member.lastName')" :rules="[val => !!val || $t('forms.required')]" />
        <q-input outlined v-model="nif" label="NIF o NIE" :rules="[val => !!val || $t('forms.required'), val => !!validateNif(val) || $t('forms.validNif')]" />
        <q-input outlined v-model="email" type="email" :label="$t('member.email')" :rules="[val => !!val || $t('forms.required'), val => !!emailPattern.test(val) || $t('forms.validEmail')]" />
        <q-input outlined v-model="phone" type="tel" :label="$t('member.phone')" :rules="[val => !!val || $t('forms.required'), val => !!phonePattern.test(val) || $t('forms.validPhone')]" />
        <q-btn :loading="updateMemberLoading" color="primary" type="submit">{{$t('forms.save')}}</q-btn>
      </q-form>
    </div>
  </q-page>
</template>

<script lang="ts">
import { useRoute } from 'vue-router'
import { MembersService } from 'src/services/members'
import { computed, ref, reactive, toRefs } from 'vue'
import firebase from 'firebase/app'
import 'firebase/auth'
import { validateSpanishId } from 'spain-id'
import { Member } from '@/models/Member'

export default {
  name: 'PagePersonalData',
  setup () {
    const data = reactive<Member>({
      id: '',
      firstName: '',
      lastName: '',
      nif: '',
      email: '',
      phone: '',
      familyId: undefined,
      family: undefined
    })

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

    const { member, loading, error, onResult } = membersService.getById(id.value)

    onResult(() => {
      data.id = member.value?.id || ''
      data.firstName = member.value?.firstName || data.firstName
      data.lastName = member.value?.lastName || data.lastName
      data.nif = member.value?.nif || ''
      data.email = member.value?.email || ''
      data.phone = member.value?.phone || ''
      data.familyId = member.value?.familyId
      data.family = member.value?.family
    })

    const memberForm = ref<HTMLFormElement | null>(null)

    const { mutate, loading: updateMemberLoading, error: updateMemberError } = membersService.updateMember()

    const submitForm = () => {
      memberForm.value?.validate().then(async (success) => {
        if (success) {
          // yay, models are correct
          console.log('form submitted')
          await mutate({ id: data.id, member: { ...data } })
        } else {
          // oh no, user has filled in
          // at least one invalid value
        }
      })
    }

    return {
      ...toRefs(data),
      loading,
      error,
      submitForm,
      emailPattern,
      phonePattern,
      validateNif,
      memberForm,
      updateMemberLoading,
      updateMemberError
    }
  }
}
</script>

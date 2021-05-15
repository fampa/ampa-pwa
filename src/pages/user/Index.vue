<template>
  <q-page padding class="bg-grey-2">
    <div class="q-gutter-md max-600" v-if="id">
      <h1 class="text-h4">
        {{$t('personalData')}}
        <q-badge v-if="isAdmin" color="red">
            ADMIN
        </q-badge>
      </h1>
      <q-form ref="memberForm" @submit.prevent="submitForm">
        <q-input outlined v-model="firstName" :label="$t('member.firstName')" :rules="[val => !!val || $t('forms.required')]" />
        <q-input outlined v-model="lastName" :label="$t('member.lastName')" :rules="[val => !!val || $t('forms.required')]" />
        <q-input outlined v-model="nif" label="NIF o NIE" :rules="[val => !!val || $t('forms.required'), val => !!validateNif(val) || $t('forms.validNif')]" />
        <q-input outlined v-model="email" type="email" :label="$t('member.email')" :rules="[val => !!val || $t('forms.required'), val => !!emailPattern.test(val) || $t('forms.validEmail')]" />
        <q-input outlined v-model="phone" type="tel" :label="$t('member.phone')" :rules="[val => !!val || $t('forms.required'), val => !!phonePattern.test(val) || $t('forms.validPhone')]" />
        <q-btn :loading="updateMemberLoading" color="primary" type="submit">{{$t('forms.save')}}</q-btn>
      </q-form>

      <div v-if="admin && $route.params?.id">
        <h2 class="text-h5">ADMIN</h2>
        <div class="q-gutter-md">
          <q-btn color="accent" :label="$t('member.familyData')" :to="`/admin/family/edit/${id}`" />
          <q-btn color="accent" :label="$t('member.paymentData')" :to="`/admin/payment/edit/${id}`" />
        </div>
        <br>
        <div class="q-gutter-md">
          <q-btn color="red" :label="isAdmin ? $t('member.removeAdmin') : $t('member.addAdmin')" @click="makeAdmin" :loading="makeAdminLoading" />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { useRoute } from 'vue-router'
import { MembersService } from 'src/services/members'
import { computed, ref, reactive, toRefs, onMounted } from 'vue'
import firebase from 'firebase/app'
import 'firebase/auth'
import { validateSpanishId } from 'spain-id'
import { Member } from 'src/models/Member'
import { useQuasar } from 'quasar'
import { cleanObject } from 'src/utilities/cleanObject'
import { useStore } from 'src/services/store'
import { useI18n } from 'vue-i18n'

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
      family: undefined,
      isAdmin: false
    })

    const store = useStore()

    const admin = computed(() => store.state.user.isAdmin)

    const $q = useQuasar()

    const emailPattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/

    const phonePattern = /(6|7|9)\d{8}$/

    const validateNif = (nif: string) => validateSpanishId(nif)

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

    onMounted(() => {
      const { member, onResult, onError } = membersService.getById(id.value)

      onResult(() => {
        data.id = member.value?.id || ''
        data.firstName = member.value?.firstName || data.firstName
        data.lastName = member.value?.lastName || data.lastName
        data.nif = member.value?.nif || ''
        data.email = member.value?.email || ''
        data.phone = member.value?.phone || ''
        data.familyId = member.value?.familyId
        data.family = member.value?.family
        data.isAdmin = member.value?.isAdmin
      })

      onError(() => window.location.reload())
    })

    const i18n = useI18n()

    const memberForm = ref<HTMLFormElement | null>(null)

    const { mutate, loading: updateMemberLoading, error: updateMemberError, onError } = membersService.updateMember()

    const submitForm = () => {
      memberForm.value?.validate().then(async (success: boolean) => {
        if (success) {
          // yay, models are correct

          const clean = cleanObject({ ...data })
          // remove family property since it is not expected on that mutation
          delete clean.family
          // console.log('form submitted', clean)
          await mutate({ id: data.id, member: clean })
          $q.notify(i18n.t('forms.savedOk'))
        } else {
          // oh no, user has filled in
          // at least one invalid value
        }
      })
    }

    onError(() => {
      $q.notify({
        type: 'negative',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        message: updateMemberError.value.message
      })
    })

    const makeAdminLoading = ref<boolean>(false)

    const makeAdmin = () => {
      makeAdminLoading.value = true
      const result = membersService.makeAdmin(data)
      result
        .then((res) => {
          makeAdminLoading.value = false
          // console.log(res)
          data.isAdmin = res.data?.isAdmin
          $q.notify(i18n.t('forms.savedOk'))
        })
        .catch((err) => {
          makeAdminLoading.value = false
          $q.notify({
            type: 'negative',
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            message: err.message
          })
        })
    }

    return {
      ...toRefs(data),
      submitForm,
      emailPattern,
      phonePattern,
      validateNif,
      memberForm,
      updateMemberLoading,
      updateMemberError,
      admin,
      makeAdmin,
      makeAdminLoading
    }
  }
}
</script>

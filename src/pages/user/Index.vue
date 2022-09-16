<template>
  <q-page padding class="bg-grey-2  q-pa-md">
    <div class="max-600" v-if="id">
      <initial-steps v-if="currentUserId && loggedInMember && !loggedInMember.family?.manualPayment && !loggedInMember.family?.signatureDate" :member="loggedInMember"></initial-steps>

      <h1 class="text-h4">
        {{$t('personalData')}}
        <q-badge v-if="isAdmin" color="red">
            ADMIN
        </q-badge>
        <q-badge v-if="family?.inactive" color="red">
            {{$t('member.inactive')}}
        </q-badge>
      </h1>
      <q-form ref="memberForm" @submit.prevent="submitForm">
        <q-input :disable="family?.inactive" outlined v-model="firstName" :label="$t('member.firstName')" :rules="[val => !!val || $t('forms.required')]" />
        <q-input :disable="family?.inactive" outlined v-model="lastName" :label="$t('member.lastName')" :rules="[val => !!val || $t('forms.required')]" />
        <q-input :disable="family?.inactive" outlined v-model="nif" label="NIF o NIE" :rules="[val => !!val || $t('forms.required'), val => validateNif(val) || $t('forms.validNif')]" />
        <q-input :disable="family?.inactive" outlined v-model="email" type="email" :label="$t('member.email')" :rules="[val => !!val || $t('forms.required'), val => validateEmail(val) || $t('forms.validEmail')]" />
        <q-input :disable="family?.inactive" outlined v-model="phone" type="tel" :label="$t('member.phone')" :rules="[val => !!val || $t('forms.required'), val => validatePhone(val) || $t('forms.validPhone')]" />
        <q-btn :loading="updateMemberLoading" :disable="family?.inactive" color="primary" type="submit">{{$t('forms.save')}}</q-btn>
      </q-form>

      <div v-if="admin && $route.params?.id">
        <h2 class="text-h5">ADMIN</h2>
        <div class="q-gutter-md">
          <q-btn color="accent" :label="$t('member.familyData')" :to="`/admin/family/edit/${id}`" />
          <q-btn color="accent" :label="$t('member.paymentData')" :to="`/admin/payment/edit/${id}`" />
        </div>
        <br>
        <div class="q-gutter-md">
          <q-btn :disable="family?.inactive" color="orange" :label="isAdmin ? $t('member.removeAdmin') : $t('member.addAdmin')" @click="makeAdmin" :loading="makeAdminLoading" />
        </div>
      <br>
        <div class="q-gutter-md">
          <q-btn color="red" :label="$t('member.remove')" @click="removeMember" :loading="makeAdminLoading" />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { MembersService } from 'src/services/members'
import { computed, ref, reactive, toRefs } from 'vue'
import firebase from 'firebase/app'
import 'firebase/auth'
import { Member } from 'src/models/Member'
import { useQuasar } from 'quasar'
import { cleanObject } from 'src/utilities/cleanObject'
import { useStore } from 'src/services/store'
import { useI18n } from 'vue-i18n'
import { validateNif, validatePhone, validateEmail } from 'src/utilities/validations'
import InitialSteps from 'components/InitialSteps.vue'

export default {
  name: 'PagePersonalData',
  components: {
    InitialSteps
  },
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

    const memberData = ref<Member>(null)

    const store = useStore()

    const admin = computed(() => store.state.user.isAdmin)

    const $q = useQuasar()

    const loggedInMember = store.state.user.member

    const currentUserId = computed(() => {
      return firebase.auth().currentUser?.uid
    })

    const membersService = new MembersService()
    const route = useRoute()
    const router = useRouter()
    const id = computed(() => {
      const params = route.params?.id?.toString()
      if (params) {
        return params
      } else {
        return currentUserId.value || ''
      }
    })

    const { member, onResult, onError: onGetMemberError, refetch } = membersService.getById(id.value)

    onResult(() => {
      memberData.value = member.value
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

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    onGetMemberError(async (err) => {
      console.error(err)
      await router.push('/')
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
          // update member on store
          await store.dispatch('user/setMember', data.id)
          $q.notify(i18n.t('forms.savedOk'))
          await refetch()
        } else {
          // oh no, user has filled in
          // at least one invalid value
        }
      })
    }

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    onError(async (err) => {
      console.error(err)
      $q.notify({
        color: 'negative',
        textColor: 'white',
        message: i18n.t('forms.error', { error: err.message })
      })
      await router.push('/')
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

    const removeMember = () => {
      if (!confirm('Esteu segur de voler ELIMINAR aquest usuari? Aquesta acció no es pot desfer!!')) return
      makeAdminLoading.value = true
      const result = membersService.removeMember(data.id)
      result
        .then((res) => {
          makeAdminLoading.value = false
          console.log(res)
          $q.notify(i18n.t('forms.savedOk'))
        })
        .then(() => router.replace('/admin/users'))
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
      data,
      memberData,
      submitForm,
      validateNif,
      validatePhone,
      validateEmail,
      memberForm,
      updateMemberLoading,
      updateMemberError,
      admin,
      makeAdmin,
      makeAdminLoading,
      removeMember,
      currentUserId,
      loggedInMember
    }
  }
}
</script>

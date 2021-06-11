<template>
  <q-page padding class="bg-grey-2  q-pa-md">
    <div class="max-600">
      <h1 class="text-h4">{{$t('member.paymentData')}}</h1>
      <div v-if="getMemberLoading">
        <q-skeleton height="50px" square />
      </div>
      <q-banner v-else-if="member && !id" class="bg-red text-white">
        {{$t('member.familyDataNotice')}}
        <template v-slot:action>
          <q-btn flat color="white" :label="$t('member.familyDataNoticeBtn')" :to="'/user/family'" />
        </template>
      </q-banner>
      <div v-else-if="member && id">
        <q-input mask="ES## #### #### #### #### ####" outlined v-model.trim="iban" label="IBAN" placeholder="ES" :rules="[val => !!val || $t('forms.required'), val => validateIban(val.replace(/\s/g, '')) || $t('forms.validIBAN')]">
        </q-input>
        <br>
        <p  v-if="member.family?.signatureDate">{{$t('forms.ibanNotice')}}</p>
        <q-btn :loading="loading" :disable="!iban" color="primary" :label="$t('forms.sendMandate')" @click="updateIban"/>
        <br>
        <br>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { MembersService } from 'src/services/members'
import { useRoute, useRouter } from 'vue-router'
import { computed, reactive, toRefs, ref, onMounted } from 'vue'
import firebase from 'firebase/app'
import 'firebase/auth'
import { Family } from 'src/models/Family'
// import { cleanObject } from 'src/utilities/cleanObject'
import { useQuasar, date } from 'quasar'
import { useI18n } from 'vue-i18n'
import { validateIban } from 'src/utilities/validations'
import { useStore } from 'src/services/store'

export default {
  name: 'PagePayment',
  setup () {
    const membersService = new MembersService()
    const route = useRoute()
    const router = useRouter()
    const $q = useQuasar()
    const i18n = useI18n()
    const store = useStore()

    const familyData = reactive<Family>({
      id: undefined,
      iban: undefined
    })

    const user = computed(() => {
      return firebase.auth().currentUser
    })

    const timeCheck = computed(() => {
      const created = Number(route.query?.t)
      const unit = 'hours'
      const today = Date.now()
      const diff = date.getDateDiff(today, created, unit)
      return diff
    })

    const id = computed(() => {
      const params = route.params?.id?.toString()
      if (params) {
        return params
      } else {
        return user.value?.uid
      }
    })

    const { member, loading: getMemberLoading, onResult, onError: onGetMemberError, refetch } = membersService.getById(id.value)
    const { mutate, loading: mutateLoading, onError } = membersService.updateFamily()

    const loading = ref<boolean>(false)

    onResult(() => {
      if (member) {
        familyData.id = member.value?.familyId
        familyData.iban = member.value?.family?.iban || ''
      }
    })

    const updateIban = async () => {
      if (!validateIban(familyData.iban?.replace(/\s/g, ''))) return
      loading.value = true
      await mutate({ id: familyData.id, family: { iban: familyData.iban.replace(/\s/g, '') } })
        .then(async () => await refetch())
        .then(async () => {
          const id = familyData.id
          const language = i18n.locale
          await membersService.sendMandateMail(id, member.value, language.value)
            .then(async () => {
              $q.notify({
                timeout: 0,
                type: 'info',
                message: i18n.t('forms.sendMandateMessage', { email: member.value?.email }),
                actions: [
                  {
                    label: i18n.t('notification.close'),
                    color: 'white',
                    attrs: {
                      'aria-label': 'Dismiss'
                    }
                  }
                ]
              })
              await refetch()
              loading.value = false
            })
        })
        .catch(err => {
          console.error(err)
          loading.value = false
        })
    }

    onMounted(async () => {
      if (route.query && route.query.t && route.query.c) {
        const member = computed(() => store.state.user?.member)
        if (member.value?.family?.signatureDate) return
        loading.value = true
        if (timeCheck.value < 24) {
          console.log('make signature')
          const code = route.query.c as string
          await membersService.signMandate(member.value?.familyId, member.value, code, i18n.locale.value)
            .then(async () => {
              $q.notify({
                timeout: 0,
                type: 'info',
                message: i18n.t('forms.mandateSigned'),
                actions: [
                  {
                    label: i18n.t('notification.close'),
                    color: 'white',
                    attrs: {
                      'aria-label': 'Dismiss'
                    }
                  }
                ]
              })
              await refetch()
              loading.value = false
            })
            .catch(err => {
              console.error(err)
              loading.value = false
            })
        } else {
          $q.notify({
            timeout: 0,
            type: 'negative',
            message: i18n.t('forms.needNewMandate'),
            actions: [
              {
                label: i18n.t('notification.close'),
                color: 'white',
                attrs: {
                  'aria-label': 'Dismiss'
                }
              }
            ]
          })
        }
      }
    })

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    onError(async () => {
      await router.push('/')
    })

    onGetMemberError(() => window.location.reload())

    return {
      loading,
      getMemberLoading,
      member,
      user,
      ...toRefs(familyData),
      updateIban,
      validateIban,
      mutateLoading,
      timeCheck
    }
  }
}
</script>

<style>
</style>

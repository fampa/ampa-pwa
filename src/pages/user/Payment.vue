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
        <p class="text-caption">
          {{$t('forms.ibanNotice')}}
        </p>
        <q-btn :loading="loading" :disable="!iban" color="primary" :label="$t('forms.sendMandate', { email: member?.email })" @click="updateIban"/>
        <br>
        <br>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { MembersService } from 'src/services/members'
import { useRoute, useRouter } from 'vue-router'
import { computed, reactive, toRefs, ref } from 'vue'
import firebase from 'firebase/app'
import 'firebase/auth'
import { Family } from 'src/models/Family'
// import { cleanObject } from 'src/utilities/cleanObject'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { validateIban } from 'src/utilities/validations'

export default {
  name: 'PagePayment',
  setup () {
    const membersService = new MembersService()
    const route = useRoute()
    const router = useRouter()
    const $q = useQuasar()
    const i18n = useI18n()

    const familyData = reactive<Family>({
      id: undefined,
      iban: undefined
    })

    const user = computed(() => {
      return firebase.auth().currentUser
    })

    const id = computed(() => {
      const params = route.params?.id?.toString()
      if (params) {
        return params
      } else {
        return user.value?.uid
      }
    })

    const { member, loading: getMemberLoading, onResult, onError: onGetMemberError } = membersService.getById(id.value)
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
        .then(async () => {
          const id = familyData.id
          loading.value = true
          const language = i18n.locale
          await membersService.sendMandateMail(id, member.value, language.value)
            .then(() => {
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
              loading.value = false
            })
        })
        .catch(err => {
          console.error(err)
          loading.value = false
        })
    }

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
      mutateLoading
    }
  }
}
</script>

<style>
</style>

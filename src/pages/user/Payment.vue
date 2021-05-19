<template>
  <q-page padding class="bg-grey-2">
    <div class="max-600">
      <h1 class="text-h4">{{$t('member.paymentData')}}</h1>
      <div v-if="loading">
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
        <q-btn :loading="mutateLoading" color="primary" :label="$t('forms.save')" @click="updateIban"/>
        <br>
        <br>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { MembersService } from 'src/services/members'
import { useRoute } from 'vue-router'
import { computed, reactive, toRefs } from 'vue'
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

    const { member, loading, onResult, onError: onGetMemberError } = membersService.getById(id.value)
    const { mutate, loading: mutateLoading, onError, error } = membersService.updateFamily()

    onResult(() => {
      if (member) {
        familyData.id = member.value?.familyId
        familyData.iban = member.value?.family?.iban || ''
      }
    })

    const updateIban = async () => {
      await mutate({ id: familyData.id, family: { iban: familyData.iban.replace(/\s/g, '') } })
      $q.notify(i18n.t('forms.savedOk'))
    }

    onError(() => {
      $q.notify({
        type: 'negative',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        message: error.value.message
      })
    })

    onGetMemberError(() => window.location.reload())

    return {
      loading,
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

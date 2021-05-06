<template>
  <q-page padding class="bg-grey-2">
    <div class="max-600">
      <h1 class="text-h4">{{$t('member.paymentData')}}</h1>
      <div v-if="loading">
        <q-skeleton height="50px" square />
      </div>
      <q-banner v-else-if="!id" class="bg-red text-white">
        {{$t('member.familyDataNotice')}}
        <template v-slot:action>
          <q-btn flat color="white" :label="$t('member.familyDataNoticeBtn')" :to="'/user/family'" />
        </template>
      </q-banner>
      <div v-else>
        <q-input mask="ES## #### #### #### #### ####" outlined v-model.trim="iban" label="IBAN" placeholder="ES" :rules="[val => !!val || $t('forms.required'), val => isValidIBAN(val.replace(/\s/g, '')) || $t('forms.validIBAN')]">
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
import { isValidIBAN } from 'ibantools'
import { useQuasar } from 'quasar'
import { i18n } from 'src/boot/i18n'

export default {
  name: 'PagePayment',
  setup () {
    const membersService = new MembersService()
    const route = useRoute()
    const $q = useQuasar()
    const translate = i18n.global

    const familyData = reactive<Family>({
      id: undefined,
      iban: undefined
    })

    const currentUserId = computed(() => {
      return firebase.auth().currentUser?.uid
    })

    const id = computed(() => {
      const params = route.params?.id?.toString()
      if (params) {
        return params
      } else {
        return currentUserId.value || ''
      }
    })

    const { member, loading, onResult } = membersService.getById(id.value)
    const { mutate, loading: mutateLoading, onError, error } = membersService.updateFamily()

    onResult(() => {
      if (member) {
        familyData.id = member.value?.familyId
        familyData.iban = member.value?.family?.iban || ''
      }
    })

    const updateIban = async () => {
      await mutate({ id: familyData.id, family: { iban: familyData.iban.replace(/\s/g, '') } })
      $q.notify(translate.t('forms.savedOk'))
    }

    onError(() => {
      $q.notify({
        type: 'negative',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        message: error.value.message
      })
    })

    return {
      loading,
      member,
      ...toRefs(familyData),
      updateIban,
      isValidIBAN,
      mutateLoading
    }
  }
}
</script>

<style>
</style>

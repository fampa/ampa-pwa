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
        <q-input outlined v-model="iban" label="IBAN" placeholder="ES">
        </q-input>
        <br>
        <q-btn :loading="loading" color="primary" :label="$t('forms.save')" @click="updateIban"/>
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
import { cleanObject } from 'src/utilities/cleanObject'

export default {
  name: 'PagePayment',
  setup () {
    const membersService = new MembersService()
    const route = useRoute()

    const familyData = reactive<Family>({
      id: undefined,
      name: '',
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
    const { mutate } = membersService.updateFamily()

    onResult(() => {
      if (member) {
        familyData.id = member.value?.familyId
        familyData.iban = member.value?.family?.iban || ''
      }
    })

    const updateIban = async () => {
      console.log(familyData)
      const variables = cleanObject(familyData)
      await mutate({ family: { ...variables } })
    }

    return {
      loading,
      member,
      ...toRefs(familyData),
      updateIban
    }
  }
}
</script>

<style>
</style>

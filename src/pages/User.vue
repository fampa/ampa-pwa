<template>
  <q-page padding class="bg-grey-2">
    <h1 class="text-h4">{{$t('personalData')}}</h1>
    <div v-if="member">
      {{ member }}
      <q-input outlined v-model="member.firstName" label="Nom" />
    </div>
  </q-page>
</template>

<script lang="ts">
import { useRoute } from 'vue-router'
import { MembersService } from 'src/services/members'
import { computed } from 'vue'
import firebase from 'firebase/app'
import 'firebase/auth'

export default {
  name: 'PagePersonalData',
  setup () {
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

    return {
      member,
      loading,
      error
    }
  }
}
</script>

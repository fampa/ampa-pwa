<template>
  <q-page padding class="bg-grey-2">
    <h1 class="text-h4">{{$t('personalData')}}</h1>
    <div v-if="member">
      {{ member }}
    </div>
  </q-page>
</template>

<script lang="ts">
import { useRoute } from 'vue-router'
import { MembersService } from 'src/services/members'
import { useStore } from 'src/services/store'

export default {
  name: 'PagePersonalData',
  setup () {
    const store = useStore()
    const currentUserId = store.state.user.user?.id.toString() || ''
    const membersService = new MembersService()
    const route = useRoute()
    const id = route.params?.id?.toString() || currentUserId
    const { member, loading, error } = membersService.getById(id)

    return {
      member,
      loading,
      error
    }
  }
}
</script>

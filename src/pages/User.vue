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
import { useStore } from 'src/services/store'
import { computed } from 'vue'

export default {
  name: 'PagePersonalData',
  setup () {
    const store = useStore()
    const currentUserId = computed(() => store.state.user.user?.uid || '')
    const membersService = new MembersService()
    const route = useRoute()
    const id = computed(() => {
      if (route.params && route.params.id) {
        return route.params.id.toString()
      } else {
        return currentUserId.value.toString()
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

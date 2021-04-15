<template>
  <q-page padding class="bg-grey-2">
    <h1 class="text-h4">{{$t('personalData')}}</h1>
    {{ member }}
  </q-page>
</template>

<script lang="ts">
import { useRoute } from 'vue-router'
import { MembersService } from 'src/services/members'
export default {
  name: 'PagePersonalData',
  setup () {
    const membersService = new MembersService()
    const route = useRoute()
    const id = route.params.id.toString()
    const { member, loading, error } = membersService.getById(id)

    return {
      member,
      loading,
      error
    }
  }
}
</script>

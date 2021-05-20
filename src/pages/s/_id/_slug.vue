<template>
  <q-page padding class="bg-grey-2 q-pa-md">
    <div class="max-600" v-if="service">
      <h1 class="text-h4">{{service.name}}</h1>
      <q-img :src="service.image"></q-img>
      <p>{{service.description}}</p>
      <p>{{formatCurrency(service.price)}}/{{service.periodicity}}</p>
      <q-btn label="Matricular" color="primary" disable />
      WIP
    </div>
  </q-page>
</template>

<script lang="ts">
import { ContentsService } from 'src/services/contents'
import { useRoute } from 'vue-router'
import { computed, ref } from 'vue'
import { useQuasar } from 'quasar'
import { Service } from 'src/models/Service'
import { formatCurrency } from 'src/utilities/formatCurrency'

export default {
  name: 'PageServei',
  setup () {
    const contentsService = new ContentsService()
    const route = useRoute()
    const id = computed(() => Number(route.params.id))
    const $q = useQuasar()

    const service = ref<Service | null>(null)

    const { result, loading, error, onResult, onError } = contentsService.getServiceById(id.value)

    onResult(() => {
      service.value = result.value?.services_by_pk
    })

    onError(() => {
      $q.notify({
        type: 'negative',
        message: error.value?.message
      })
    })

    return {
      loading,
      service,
      formatCurrency
    }
  }
}
</script>

<style>
</style>

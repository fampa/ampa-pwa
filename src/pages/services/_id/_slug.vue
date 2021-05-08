<template>
  <q-page padding class="bg-grey-2">
    <div class="q-gutter-md max-600">
      <div v-if="!services && loading">
        <div class="row items-start">
          <div
            class="col-12 col-sm-6 col-md-4 q-pa-sm"
            v-for="(item, index) in [1, 2, 3, 4, 5, 6]"
            :key="index"
          >
            <q-card class="news-card">
              <q-skeleton height="200px" square />
              <q-card-section>
                <div class="text-h6 title">
                  <q-skeleton type="text" />
                </div>
                <div class="text-subtitle2">
                  <q-skeleton type="text" />
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
      <div class="row items-start">
        <div
          class="col-12 col-sm-6 col-md-4 q-pa-sm"
          v-for="service in services" :key="service.id"
        >
          <service-card :service="service"></service-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { ContentsService } from 'src/services/contents'
import { useRoute } from 'vue-router'
import { computed, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import ServiceCard from 'components/ServiceCard.vue'
import { Service } from 'src/models/Service'

export default {
  name: 'PageServei',
  components: { ServiceCard },
  setup () {
    const contentsService = new ContentsService()
    const route = useRoute()
    const id = computed(() => Number(route.params.id))
    const $q = useQuasar()

    const services = ref<Service[]>([])

    const { result, loading, error, onResult, onError, refetch } = contentsService.getServicesByTypeId(id.value)

    onResult(() => {
      getServices()
    })

    const getServices = () => {
      services.value = result.value?.services
    }

    watch(() => id.value,
      async (newVal, oldVal) => {
        if (newVal && newVal !== oldVal) {
          // console.log('newVal', newVal)
          await refetch({ typeId: newVal })
          getServices()
        }
      })

    onError(() => {
      $q.notify({
        type: 'negative',
        message: error.value?.message
      })
    })

    return {
      loading,
      services
    }
  }
}
</script>

<style>
</style>

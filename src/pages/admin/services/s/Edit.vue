<template>
  <q-page padding class="bg-grey-2  q-pa-md">
    <div class="max-600">
      <h1 class="text-h4">{{$t('service.edit.title')}}</h1>
      <q-form ref="memberForm" @submit.prevent="submitForm">
        <q-input outlined v-model="service.name" :label="$t('service.edit.name')" :rules="[val => !!val || $t('forms.required')]" />
        <q-input outlined v-model="service.description" :label="$t('service.edit.description')" :rules="[val => !!val || $t('forms.required')]" />
        <q-input style="width:50%" prefix="€" type="number" step="0.01" outlined v-model.number="service.price" :label="$t('service.edit.price')" :rules="[val => !!val || $t('forms.required')]" />
        <q-select style="width:50%" :options="periodicityOptions" type="number" outlined v-model="service.periodicity" :label="$t('service.edit.periodicity')" :rules="[val => !!val || $t('forms.required')]" />
        <q-input style="width:50%" type="number" outlined v-model.number="service.spots" :label="$t('service.edit.spots')" :rules="[val => !!val || $t('forms.required')]" />
        <q-input outlined v-model="service.image" :label="$t('service.edit.image')" />
        <br>
        <div class="q-gutter-sm">
          <q-checkbox v-model="service.isAvailable" :label="$t('service.edit.availability')" />
        </div>
        <br>
        <q-btn :loading="loading" color="primary" type="submit">{{$t('forms.save')}}</q-btn> <q-btn v-if="id" color="red" class="float-right" :label="$t('remove.title')" @click="remove" />
      </q-form>

      <div id="participants">
        <h2 class="text-h5">{{$t('service.edit.participants')}}</h2>
        <ul>
          <li v-for="(participant, index) in service.participants" :key="index">
            {{participant.child.firstName}} {{participant.child.lastName}} ({{participant.child.birthDate}}) <q-btn flat round color="red" icon="las la-trash" @click="unJoin(participant.child.id)" />
          </li>
        </ul>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Service } from 'src/models/Service'
import { useRoute, useRouter } from 'vue-router'
import { AdminService } from 'src/services/admin'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { ContentsService } from 'src/services/contents'

export default {
  name: 'EditService',
  setup () {
    const route = useRoute()
    const router = useRouter()
    const id = computed(() => Number(route.params?.id))
    const adminService = new AdminService()
    const $q = useQuasar()
    const i18n = useI18n()
    const contentsService = new ContentsService()
    // Data
    const loading = ref<boolean>(false)
    const service = ref<Service>({
      id: null,
      name: null,
      description: null,
      typeId: null,
      image: null,
      spots: 0,
      participants: null,
      price: null,
      periodicity: null,
      isAvailable: false
    })

    const periodicityOptions = ['mensual', 'anual']

    const { mutate, loading: loadingMutate } = adminService.upsertService()
    const { mutate: removeService } = adminService.removeService()
    const { result, loading: loadingGet, onResult, refetch: refetchService } = adminService.getServiceById(id.value)
    const getService = () => {
      loading.value = loadingGet.value
      onResult(() => {
        service.value.id = result.value?.services_by_pk?.id
        service.value.name = result.value?.services_by_pk?.name
        service.value.description = result.value?.services_by_pk?.description
        service.value.image = result.value?.services_by_pk?.image
        service.value.typeId = result.value?.services_by_pk?.typeId
        service.value.price = result.value?.services_by_pk?.price
        service.value.periodicity = result.value?.services_by_pk?.periodicity
        service.value.spots = Number(result.value?.services_by_pk?.spots)
        service.value.isAvailable = result.value?.services_by_pk?.isAvailable
        service.value.participants = result.value?.services_by_pk?.participants

        loading.value = false
      })
    }

    onMounted(() => {
      if (id.value) {
        getService()
      }
    })

    // Methods
    const submitForm = async () => {
      loading.value = loadingMutate.value
      const serviceData = service.value
      delete serviceData.participants
      await mutate({ insertInput: serviceData })
      $q.notify(i18n.t('forms.savedOk'))
      loading.value = false
      await router.replace(`/admin/services/edit/${service.value?.typeId}`)
    }

    const remove = () => {
      $q.dialog({
        title: i18n.t('remove.title'),
        message: i18n.t('remove.question'),
        cancel: true,
        persistent: true
      }).onOk(async () => {
        await removeService({ id: id.value })
      }).onOk(async () => {
        // console.log('>>>> second OK catcher')
        $q.notify(i18n.t('remove.confirm'))
        await router.replace(`/admin/services/edit/${service.value?.typeId}`)
      }).onCancel(() => {
        // console.log('>>>> Cancel')
      }).onDismiss(() => {
        // console.log('I am triggered on both OK and Cancel')
      })
    }

    const { mutate: unJoinMutation } = contentsService.unJoinService()

    const unJoin = (childId: number) => {
      console.log('removed', childId)
      loading.value = true
      $q.dialog({
        title: i18n.t('remove.title'),
        message: i18n.t('remove.question'),
        cancel: true,
        persistent: true
      }).onOk(async () => {
        await unJoinMutation({
          childId,
          serviceId: id.value
        })
          .then(async () => {
            await refetchService()
            loading.value = false
          })
          .catch(err => {
            console.error(err)
            loading.value = false
          })
      }).onOk(() => {
        // console.log('>>>> second OK catcher')
        $q.notify(i18n.t('remove.confirm'))
        // await router.replace(`/admin/services/edit/${service.value?.typeId}`)
      }).onCancel(() => {
        // console.log('>>>> Cancel')
      }).onDismiss(() => {
        // console.log('I am triggered on both OK and Cancel')
      })
    }

    return {
      service,
      submitForm,
      loading,
      id,
      remove,
      periodicityOptions,
      unJoin
    }
  }

}
</script>

<style>

</style>

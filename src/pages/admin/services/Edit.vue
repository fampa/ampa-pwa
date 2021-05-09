<template>
  <q-page padding class="bg-grey-2">
    <div class="max-600">
      <h1 class="text-h4">{{$t('service.type.edit')}}</h1>
      <q-form ref="memberForm" @submit.prevent="submitForm">
        <q-input outlined v-model="serviceType.name" :label="$t('service.type.name')" :rules="[val => !!val || $t('forms.required')]" />
        <q-input outlined v-model="serviceType.description" :label="$t('service.type.description')" />
        <p>{{$t('service.type.iconPre')}} <a href="https://icons8.com/line-awesome" target="_blank" rel="noopener noreferrer">Line Awesome</a></p>
        <q-input bottom-slots outlined v-model="serviceType.icon" :label="$t('service.type.icon')" :rules="[val => !!val || $t('forms.required')]">
          <template v-slot:before>
            <q-icon :name="serviceType.icon" />
          </template>
          <template v-slot:hint>
            {{$t('service.type.iconHint')}} <a href="https://icons8.com/line-awesome" target="_blank" rel="noopener noreferrer"></a>
          </template>
        </q-input>
        <br>
        <q-btn :loading="loading" color="primary" type="submit">{{$t('forms.save')}}</q-btn> <q-btn v-if="id" color="red" class="float-right" :label="$t('remove.title')" @click="remove" />
      </q-form>
      <router-view v-if="id"></router-view>
    </div>
  </q-page>
</template>

<script lang="ts">
import { ref, computed } from 'vue'
import { ServiceType } from 'src/models/Service'
import { useRoute, useRouter } from 'vue-router'
import { AdminService } from 'src/services/admin'
import { useQuasar } from 'quasar'
import { i18n } from 'src/boot/i18n'

export default {
  name: 'EditServiceType',
  setup () {
    const route = useRoute()
    const router = useRouter()
    const id = computed(() => Number(route.params?.id))
    const adminService = new AdminService()
    const $q = useQuasar()
    const translate = i18n.global
    // Data
    const loading = ref<boolean>(false)
    const serviceType = ref<ServiceType>({
      name: null,
      description: null,
      icon: 'las la-school'
    })

    const { mutate, loading: loadingMutate } = adminService.upsertServiceType()
    const { mutate: removeServiceType } = adminService.removeServiceType()
    if (id.value) {
      const { result, loading: loadingGet, onResult } = adminService.getServiceTypeById(id.value)
      loading.value = loadingGet.value
      onResult(() => {
        serviceType.value.id = result.value?.service_types_by_pk?.id
        serviceType.value.name = result.value?.service_types_by_pk?.name
        serviceType.value.description = result.value?.service_types_by_pk?.description
        serviceType.value.icon = result.value?.service_types_by_pk?.icon
        loading.value = false
      })
    }

    // Methods
    const submitForm = async () => {
      loading.value = loadingMutate.value
      await mutate({ insertInput: serviceType.value })
      $q.notify(translate.t('forms.savedOk'))
      loading.value = false
      await router.replace('/admin/services')
    }

    const remove = () => {
      $q.dialog({
        title: translate.t('remove.title'),
        message: translate.t('remove.question'),
        cancel: true,
        persistent: true
      }).onOk(async () => {
        await removeServiceType({ id: id.value })
      }).onOk(async () => {
        // console.log('>>>> second OK catcher')
        $q.notify(translate.t('remove.confirm'))
        await router.replace('/admin/services')
      }).onCancel(() => {
        // console.log('>>>> Cancel')
      }).onDismiss(() => {
        // console.log('I am triggered on both OK and Cancel')
      })
    }

    return {
      serviceType,
      submitForm,
      loading,
      id,
      remove
    }
  }

}
</script>

<style>

</style>

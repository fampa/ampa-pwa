<template>
  <q-page padding class="bg-grey-2  q-pa-md">
    <div class="max-600">
      <h1 class="text-h4">{{$t('tag.type.edit')}}</h1>
      <q-form ref="memberForm" @submit.prevent="submitForm">
        <div v-for="(lang, index) in langOptions" :key="index">
          <q-input outlined v-model="translations[index].name" :label="lang.label" :rules="[val => !!val || $t('forms.required')]" />
        </div>
         <div class="q-gutter-sm">
          <q-checkbox v-model="tag.isMenu" :label="$t('content.isMenu')" />
        </div>

        <q-input bottom-slots outlined v-model="tag.icon" :label="$t('service.type.icon')" :rules="[val => !!val || $t('forms.required')]">
          <template v-slot:before>
            <q-icon :name="tag.icon" />
          </template>
          <template v-slot:hint>
            {{$t('service.type.iconPre')}} <a href="https://icons8.com/line-awesome" target="_blank" rel="noopener noreferrer">Line Awesome</a>
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
import { useRoute, useRouter } from 'vue-router'
import { AdminService } from 'src/services/admin'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { ContentsService } from 'src/services/contents'
import { Tag, TagTranslation } from 'src/models/Tag'

export default {
  name: 'EditServiceType',
  setup () {
    const route = useRoute()
    const router = useRouter()
    const contentsService = new ContentsService()
    const id = computed(() => Number(route.params?.id))
    const adminService = new AdminService()
    const $q = useQuasar()
    const i18n = useI18n()
    const availableLocales = i18n.availableLocales.map(l => {
      return {
        label: i18n.t(l),
        value: l
      }
    })
    const langOptions = ref(availableLocales)
    // Data
    const loading = ref<boolean>(false)
    const tag = ref<Tag>({
      icon: 'las la-school',
      isMenu: false
    })

    const translations = ref<TagTranslation[]>(i18n.availableLocales.map(l => {
      return {
        tagId: id.value,
        name: tag.value?.translations?.find(t => t.language === l).name,
        language: l
      }
    }))

    // const { mutate, loading: loadingMutate } = adminService.upsertServiceType()
    const { mutate: removeServiceType } = adminService.removeServiceType()
    if (id.value) {
      const { result, loading: loadingGet, onResult } = contentsService.getTagById(id.value)
      loading.value = loadingGet.value
      onResult(() => {
        tag.value.id = result.value?.tags_by_pk?.id
        tag.value.isMenu = result.value?.tags_by_pk?.isMenu
        translations.value = result.value?.tags_by_pk?.translations
        tag.value.icon = result.value?.tags_by_pk?.icon
        loading.value = false
      })
    }

    // Methods
    const submitForm = async () => {
      // loading.value = loadingMutate.value
      // await mutate({ insertInput: serviceType.value })
      $q.notify(i18n.t('forms.savedOk'))
      loading.value = false
      await router.replace('/admin/services')
    }

    const remove = () => {
      $q.dialog({
        title: i18n.t('remove.title'),
        message: i18n.t('remove.question'),
        cancel: true,
        persistent: true
      }).onOk(async () => {
        await removeServiceType({ id: id.value })
      }).onOk(async () => {
        // console.log('>>>> second OK catcher')
        $q.notify(i18n.t('remove.confirm'))
        await router.replace('/admin/services')
      }).onCancel(() => {
        // console.log('>>>> Cancel')
      }).onDismiss(() => {
        // console.log('I am triggered on both OK and Cancel')
      })
    }

    return {
      tag,
      translations,
      submitForm,
      loading,
      id,
      remove,
      langOptions
    }
  }

}
</script>

<style>

</style>

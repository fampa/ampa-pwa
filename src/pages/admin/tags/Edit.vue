<template>
  <q-page padding class="bg-grey-2  q-pa-md">
    <div class="max-600">
      <h1 class="text-h4">{{$t('tag.edit')}}</h1>
      <q-form ref="memberForm" @submit.prevent="submitForm">
        <q-select outlined v-model="tag.type" :options="typeOptions" :label="$t('content.type.title')" emit-value map-options :rules="[val => !!val || $t('forms.required')]" />
        <div v-for="(translation, index) in translations" :key="index">
          <q-input outlined v-model="translation.name" :label="$t(translation.language)" :rules="[val => !!val || $t('forms.required')]" />
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
        <q-btn v-if="id" color="red" :label="$t('remove.title')" @click="remove" /> <q-btn  class="float-right" :loading="loading" color="primary" type="submit">{{$t('forms.save')}}</q-btn>
      </q-form>
      <router-view v-if="id"></router-view>
    </div>
  </q-page>
</template>

<script lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { ContentsService } from 'src/services/contents'
import { Tag, TagTranslation } from 'src/models/Tag'
import { cleanObject } from 'src/utilities/cleanObject'

export default {
  name: 'EditServiceType',
  setup () {
    const route = useRoute()
    const router = useRouter()
    const contentsService = new ContentsService()
    const id = computed(() => Number(route.params?.id))
    const $q = useQuasar()
    const i18n = useI18n()
    // Data
    const availableLocales = i18n.availableLocales.map(l => {
      return {
        label: i18n.t(l),
        value: l
      }
    })
    const langOptions = ref(availableLocales)
    const typeOptions = ref([
      {
        value: 'article',
        label: i18n.t('content.type.article')
      },
      {
        value: 'page',
        label: i18n.t('content.type.page')
      },
      {
        value: 'service',
        label: i18n.t('content.type.service')
      }
    ])
    const loading = ref<boolean>(false)
    const tag = ref<Tag>({
      icon: 'las la-school',
      isMenu: false,
      type: 'article'
    })

    const translations = ref<TagTranslation[]>(i18n.availableLocales.map(l => {
      return {
        tagId: id.value,
        name: null,
        language: l
      }
    }))

    const { mutate: upsertTag, loading: loadingMutate } = contentsService.upsertTag()
    // const { mutate: removeTag } = contentsService.
    const { result, loading: loadingGet, onResult } = contentsService.getTagById(id.value)
    onMounted(() => {
      if (id.value) {
        loading.value = loadingGet.value
        onResult(() => {
          const tagTemp = { ...result.value?.tags_by_pk } as Tag
          console.log('tagTemp', tagTemp)
          tag.value = tagTemp
          translations.value = tagTemp.translations
          loading.value = false
          console.log('translations', translations)
        })
      }
    })

    // Methods
    const submitForm = async () => {
      loading.value = loadingMutate.value
      const tagTemp = Object.assign({ ...tag.value })
      tagTemp.translations = {}
      tagTemp.translations.data = { ...translations.value }
      cleanObject(tagTemp)
      await upsertTag({ tag: tagTemp })
      $q.notify(i18n.t('forms.savedOk'))
      loading.value = false
      await router.replace('/admin/tags')
    }

    const remove = () => {
      $q.dialog({
        title: i18n.t('remove.title'),
        message: i18n.t('remove.question'),
        cancel: true,
        persistent: true
      }).onOk(async () => {
        // await removeTag({ id: id.value })
      }).onOk(async () => {
        // console.log('>>>> second OK catcher')
        $q.notify(i18n.t('remove.confirm'))
        await router.replace('/admin/tags')
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
      langOptions,
      typeOptions
    }
  }

}
</script>

<style>

</style>

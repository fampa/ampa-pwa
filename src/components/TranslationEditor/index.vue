<template>
  <form class="content-editor q-pa-md">
    <main class="row q-col-gutter-sm">
      <div class="col-md-8">
        <div class="row">
          <div class="col-12">
            <div v-for="(translation, index) in translations" :key="index">
              <q-input v-if="translation.language === lang" borderless ref="title" class="title-input" v-model="translation.title"  :placeholder="$t('content.title')" :rules="[val => !!val || $t('forms.required')]" />
            </div>
          </div>
        </div>
        <div class="row" v-if="['page', 'article', 'service'].includes(type)">
          <div class="col-12">
            <div v-for="(translation, index) in translations" :key="index">
              <div v-if="translation.language === lang">
                <content-editor v-model="translation.content" />
              </div>
            </div>
          </div>
        </div>

      </div> <!-- Fin columna principal -->

      <div class="col-md-4">
        <div class="row">
          <div class="col-12">
            <q-select outlined v-model="lang" :options="langOptions" label="Selecciona idioma a editar" emit-value map-options />
          </div>
        </div>
        <div class="row">
          <div class="col-12">
            <q-select outlined v-model="content.isPublished" :options="statusOptions" label="Status" emit-value map-options />
          </div>
        </div>

        <div class="row">
          <div class="col-12">
            <q-input filled v-model="content.createdAt">
              <template v-slot:prepend>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy transition-show="scale" transition-hide="scale">
                    <q-date v-model="content.createdAt" mask="YYYY-MM-DD HH:mm">
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="Close" color="primary" flat />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>

              <template v-slot:append>
                <q-icon name="access_time" class="cursor-pointer">
                  <q-popup-proxy transition-show="scale" transition-hide="scale">
                    <q-time v-model="content.createdAt" mask="YYYY-MM-DD HH:mm" format24h>
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="Close" color="primary" flat />
                      </div>
                    </q-time>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>
        </div><!--  datetime row -->

        <div v-if="['page', 'tag'].includes(type)">
          <div class="q-gutter-sm">
            <q-checkbox v-model="content.isMenu" :label="$t('content.isMenu')" />
          </div>
          <q-input bottom-slots outlined v-model="content.icon" :label="$t('service.type.icon')">
            <template v-slot:before>
              <q-icon :name="content.icon" />
            </template>
            <template v-slot:hint>
              {{$t('service.type.iconPre')}} <a href="https://icons8.com/line-awesome" target="_blank" rel="noopener noreferrer">Line Awesome</a>
            </template>
          </q-input>
        </div>
        <div v-if="['service'].includes(type)">
          Especific de servei
        </div>

        <div v-if="['article', 'service'].includes(type)">
          <div class="row">
             <div style="min-width: 250px; max-width: 300px">
              <q-select
                filled
                v-model="selectedTags"
                multiple
                :options="tagsOptions"
                use-chips
                stack-label
                @remove="removeContentTag"
                :label="$t('table.tag')"
              />
            </div>
            <div>
              <q-btn flat dense icon="add" :label="$t('admin.tags')" to="/admin/tag" />
            </div>
          </div>
          <div class="row" v-if="content.image">
            <div class="image-wrapper-2">
              <q-img
                class="content-image cursor-pointer"
                :src="content.image"
                @click="getImagesPrompt = true"
              >
              </q-img>
              <q-btn class="remove-button" round flat size="xm" color="primary" @click="removeImage"  label="X" />
          </div>
        </div>

          <div>
            <get-images :path-prefix="pathPrefix" @cancel="getImagesPrompt = false" @selected="imageSelected" :prompt="getImagesPrompt" />
          </div>

          <div class="row" v-if="!content.image">
            <div class="col">
              <q-btn @click="getImagesPrompt = true" color="accent" label="Añadir imagen de portada" />
            </div>
          </div>
        </div>

      </div> <!-- Fin columna lateral -->
    </main>

    <q-dialog v-model="dialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="save" color="primary" text-color="white" />
          <span class="q-ml-sm">El artículo se encuentra en estado de borrador. ¿Quieres solo guardar o guardar y publicar?</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" v-close-popup />
          <q-btn flat label="Solo guardar" @click="guardar(false)" color="primary" v-close-popup />
          <q-btn label="Guardar y publicar" @click="guardar(true)" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn :loading="loading" fab icon="save" color="primary" @click="preSave" />
    </q-page-sticky>

    <q-page-sticky position="bottom-left" :offset="[18, 18]">
      <q-btn fab icon="las la-trash" color="negative" @click="remove" />
    </q-page-sticky>
  </form>
</template>

<script lang="ts">
import ContentEditor from './ContentEditor.vue'
import GetImages from './GetImages.vue'
import { ref, PropType, defineComponent, computed } from 'vue'
import firebase from 'firebase/app'
import 'firebase/storage'
import { useQuasar, date } from 'quasar'
import { useI18n } from 'vue-i18n'
import { Content } from 'src/models/Content'
import { ContentTranslation } from 'src/models/ContentTranslation'
import { useStore } from 'src/services/store'
import { cleanObject } from 'src/utilities/cleanObject'
// import { Tag } from 'src/models/Tag'
import { ContentsService } from 'src/services/contents'

const formatDate = (inputDate: Date) => {
  return date.formatDate(inputDate, 'YYYY-MM-DD HH:mm')
}

export default defineComponent({
  name: 'TranslationEditor',
  components: {
    ContentEditor,
    GetImages
  },
  props: {
    inputContent: {
      type: Object as PropType<Content>,
      required: false
    },
    type: String,
    loading: Boolean
  },
  emits: ['guardar', 'remove', 'removeTag'],
  setup (props, { emit }) {
    const $q = useQuasar()
    const i18n = useI18n()
    const store = useStore()

    const contentsService = new ContentsService()
    const { result: tagsResult, onResult: onTagsResult } = contentsService.getTags()
    // Data
    const dialog = ref(false)
    // const image = ref<string>(null)
    const triggerUpload = ref(false)
    const pendingImages = ref(false)
    const lang = ref(i18n.availableLocales[0])
    const availableLocales = i18n.availableLocales.map(l => {
      return {
        label: i18n.t(l),
        value: l
      }
    })
    const user = computed(() => store.state.user.user)
    const getImagesPrompt = ref(false)
    const tagsOptions = ref<{label: string, value: number}[]>([])
    const selectedTags = ref<{label: string, value: number}[]>(props.inputContent.tags?.map(t => {
      return {
        value: t.tag.id,
        label: t.tag.translations.find(tr => tr.language === lang.value).title
      }
    }))
    const langOptions = ref(availableLocales)
    const statusOptions = ref([
      { label: i18n.t('content.draft'), value: false },
      { label: i18n.t('content.published'), value: true }
    ])
    const content = ref<Content>(Object.assign(props.inputContent))
    const translations = ref<ContentTranslation[]>(i18n.availableLocales.map(l => {
      return {
        parentId: props.inputContent?.id,
        title: props.inputContent?.translations?.find(t => t.language === l).title,
        language: l,
        content: props.inputContent?.translations?.find(t => t.language === l).content
      }
    }))
    // const tags = ref<Tag[]>(props.inputContent.tags?.map(t => {
    //   return {
    //     id: t.tag.id,
    //     translations: t.tag.translations
    //   }
    // }))

    onTagsResult(() => {
      tagsOptions.value = tagsResult.value.content?.map(tag => {
        return {
          value: tag.id,
          label: tag.translations.find(t => t.language === lang.value).title
        }
      })
    })

    const pathPrefix = computed(() => `media/${user.value.uid}/`)

    // methods
    const imageSelected = (image) => {
      // console.log(image)
      content.value.image = image
      getImagesPrompt.value = false
    }

    const removeContentTag = (tag) => {
      emit('removeTag', tag.value)
    }

    const preSave = () => {
      // if (!this.validation) return
      if (content.value.isPublished) {
        return guardar()
      } else {
        dialog.value = true
      }
    }

    const guardar = (publicar = false) => {
      // if (!this.validation) return
      if (publicar) {
        content.value.isPublished = true
      }
      content.value.translations = translations.value
      const tags = selectedTags.value?.map(t => t.value)
      content.value.authorId = user.value.uid
      content.value.type = props.type
      const obj = { ...content.value }
      cleanObject(obj)
      if (content.value.image || !pendingImages.value) return emit('guardar', { content: obj, tags })
      // this.$refs.uploader.upload()
    }

    const imageAdded = () => {
      pendingImages.value = true
    }

    const imageRemoved = () => {
      pendingImages.value = false
    }

    const removeImage = () => {
      content.value.image = null
    }

    const deleteImage = () => {
      const refFromUrl = firebase.storage().refFromURL(content.value.image)
      refFromUrl.delete().then(() => {
        content.value.image = null
        return guardar()
      })
        .catch(err => $q.notify(err))
    }

    const uploadImage = (obj) => {
      // console.log(obj)
      content.value.image = obj.url
      emit('guardar', content)
    }

    const remove = () => {
      emit('remove', content)
    }

    return {
      content,
      translations,
      dialog,
      guardar,
      triggerUpload,
      langOptions,
      statusOptions,
      imageSelected,
      preSave,
      imageAdded,
      imageRemoved,
      removeImage,
      deleteImage,
      uploadImage,
      lang,
      formatDate,
      remove,
      getImagesPrompt,
      pathPrefix,
      tagsOptions,
      selectedTags,
      removeContentTag
    }
  }
})
</script>

<style lang="scss">
.image-wrapper-2 {
  position: relative;
  width: 100%;
}
.q-uploader {
  margin-bottom: 1rem;
  width: 100%;
}

.title-input {
    font-size: 2.5rem;
    line-height: 2.5rem;
    color: lightgray;
  }
.content-editor {

  label {
    margin-bottom: 2rem;
  }
  .title-input{
    margin-bottom:0;
  }

}
</style>

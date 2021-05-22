<template>
  <form class="article-editor q-pa-md">
    <main class="row q-col-gutter-sm">
      <div class="col-md-8">
        <div class="row">
          <div class="col-12">
            <div v-for="(translation, index) in translations" :key="index">
              <q-input v-if="translation.language === lang" borderless ref="title" class="title-input" v-model="translation.title"  :placeholder="$t('article.title')" :rules="[val => !!val || $t('forms.required')]" />
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-12">
            <!-- <div v-for="(translation, index) in translations" :key="index">
              <content-editor v-if="translation.language === lang" v-model="translation.content" @input="content" />
            </div> -->
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
            <q-select outlined v-model="article.status" :options="statusOptions" label="Status" emit-value map-options />
          </div>
        </div>

        <div class="row">
          <div class="col-12">
            <q-input filled v-model="article.createdAt">
              <template v-slot:prepend>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy transition-show="scale" transition-hide="scale">
                    <q-date v-model="article.createdAt" mask="YYYY-MM-DD HH:mm">
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
                    <q-time v-model="article.createdAt" mask="YYYY-MM-DD HH:mm" format24h>
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

        <div class="row" v-if="article.image">
          <div class="image-wrapper-2">
            <q-img
              class="article-image cursor-pointer"
              :src="article.image"
              @click="getImagesPrompt = true"
            >
            </q-img>
            <q-btn class="remove-button" round flat size="xm" color="primary" @click="removeImage"  label="X" />
          </div>
        </div>

        <div>
          <!-- <get-images @cancel="getImagesPrompt = false" @selected="imageSelected" :prompt="getImagesPrompt" /> -->
        </div>

        <div class="row" v-if="!article.image">
          <div class="col">
            <q-btn @click="getImagesPrompt = true" color="accent" label="Añadir imagen de portada" />
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
      <q-btn fab icon="save" color="primary" @click="preSave" />
    </q-page-sticky>
  </form>
</template>

<script lang="ts">
// import ContentEditor from './ContentEditor.vue'
// import GetImages from './GetImages.vue'
import { ref, PropType, computed, defineComponent } from 'vue'
import firebase from 'firebase/app'
import 'firebase/storage'
import { Article } from 'src/models/Article'
import { useQuasar, date } from 'quasar'
import { useI18n } from 'vue-i18n'
// import { ArticlesService } from 'src/services/articles'
import { useRoute } from 'vue-router'
import { ArticleTranslation } from 'src/models/ArticleTranslation'

const formatDate = (inputDate: Date) => {
  return date.formatDate(inputDate, 'YYYY-MM-DD HH:mm')
}

export default defineComponent({
  name: 'ArticleEditor',
  components: {
    // ContentEditor,
    // GetImages
  },
  props: {
    inputArticle: {
      type: Object as PropType<Article>,
      required: false
    }
  },
  emits: ['guardar'],
  setup (props, { emit }) {
    const $q = useQuasar()
    const i18n = useI18n()
    const router = useRoute()
    // Data
    const article = ref<Article>(Object.assign(props.inputArticle))
    const translations = ref<ArticleTranslation[]>(i18n.availableLocales.map(l => {
      return {
        title: props.inputArticle.translations.find(t => t.language === l).title,
        language: l,
        content: props.inputArticle.translations.find(t => t.language === l).content
      }
    }))
    const id = computed(() => Number(router.params?.id))
    const dialog = ref(false)
    // const image = ref<string>(null)
    const getImagesPrompt = ref(false)
    const triggerUpload = ref(false)
    const pendingImages = ref(false)
    const lang = ref(i18n.availableLocales[0])
    const availableLocales = i18n.availableLocales.map(l => {
      return {
        label: i18n.t(l),
        value: l
      }
    })
    const langOptions = ref(availableLocales)
    const statusOptions = ref([
      { label: i18n.t('article.draft'), value: 'DRAFT' },
      { label: i18n.t('article.published'), value: 'PUBLISHED' }
    ])

    // methods
    const imageSelected = (image) => {
      // console.log(image)
      article.value.image = image
      getImagesPrompt.value = false
    }

    const preSave = () => {
      // if (!this.validation) return
      if (article.value.status === 'PUBLISHED') {
        return guardar()
      } else {
        dialog.value = true
      }
    }

    const guardar = (publicar = false) => {
      // if (!this.validation) return
      if (publicar) {
        article.value.status = 'PUBLISHED'
      }
      if (id.value) {
        article.value.id = id.value
      }
      article.value.translations = translations.value
      if (article.value.image || !pendingImages.value) return emit('guardar', article)
      // this.$refs.uploader.upload()
    }

    const imageAdded = () => {
      pendingImages.value = true
    }

    const imageRemoved = () => {
      pendingImages.value = false
    }

    const removeImage = () => {
      article.value.image = null
    }

    const deleteImage = () => {
      const refFromUrl = firebase.storage().refFromURL(article.value.image)
      refFromUrl.delete().then(() => {
        article.value.image = null
        return guardar()
      })
        .catch(err => $q.notify(err))
    }

    const uploadImage = (obj) => {
      // console.log(obj)
      article.value.image = obj.url
      emit('guardar', article)
    }

    return {
      article,
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
      formatDate
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
.article-editor {

  label {
    margin-bottom: 2rem;
  }
  .title-input{
    margin-bottom:0;
  }

}
</style>

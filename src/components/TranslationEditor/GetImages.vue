<template>
    <q-dialog v-model="open" persistent style="min-width: 600px;">
      <q-card>
        <q-tabs
        v-model="tabs"
        inline-label
        class="bg-purple text-white shadow-2"
      >
        <q-tab v-if="unsplashAccessKey" name="unsplash" icon="las la-image" label="Unsplash">
        </q-tab>

        <q-tab name="own" icon="las la-camera" label="Imatges pròpies">
        </q-tab>
        <q-tab name="url" icon="las la-link" label="URL">
        </q-tab>
      </q-tabs>
      <own-images @selected="selectImage" path-prefix="media"  v-if="tabs === 'own'">
      </own-images>
      <unsplash-component @selected="selectImage" v-if="unsplashAccessKey && tabs === 'unsplash'">
      </unsplash-component>
      <q-card-section v-if="tabs === 'url'">
        <q-input type="url" label="url" v-model="imageUrl" ></q-input>
        <q-img
        v-if="imageUrl"
        class="cursor-pointer"
        :src="imageUrl"
        style="max-height: 300px;"
        @click="selectImage({url: imageUrl, caption: caption})"
        >
        </q-img>
        <q-input type="text" :label="$t('images.own.caption')" v-model="caption"></q-input>
      </q-card-section>
        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancelar" @click="$emit('cancel')" />
        </q-card-actions>
      </q-card>
    </q-dialog>
</template>

<script lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'
import OwnImages from './OwnImages.vue'
import UnsplashComponent from './UnsplashComponent.vue'
export default {
  components: {
    OwnImages,
    UnsplashComponent
  },
  props: {
    prompt: Boolean
  },
  emits: ['command', 'selected', 'cancel'],
  setup (props, { emit }) {
    // data
    const command = ref(null)
    const images = ref<string[]>([])
    const open = ref(false)
    const tabs = ref(process.env.UNSPLASH_ACCESS_KEY ? 'unsplash' : 'url')
    const imageUrl = ref('')
    const unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY
    const caption = ref('')

    // methods
    const setCommand = (command) => {
      command.value = command
    }

    onBeforeUnmount(() => {
      open.value = false
    })

    const selectImage = (image) => {
      const obj = {
        image: image,
        command: command.value
      }
      emit('command', obj)
      const img = {
        url: image.url,
        caption: image.caption
      }
      emit('selected', img)
    }

    watch(() => props.prompt,
      () => {
        open.value = props.prompt
      }
    )

    return {
      images,
      selectImage,
      setCommand,
      open,
      tabs,
      imageUrl,
      unsplashAccessKey,
      caption
    }
  }

}

</script>

<style>
.image-wrapper {
  display: inline-block;
  position: relative;
}
.remove-button {
  position: absolute;
  top: 2px;
  left: 5px;
}
.q-uploader {
  margin-bottom: 1rem;
  width: 100%;
}
</style>

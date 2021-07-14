<template>
      <q-card>
        <q-card-section>
          <div class="text-h6">{{$t('images.own.title')}}</div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <div class="image-wrapper" v-for="(image, index) in images" :key="index">
            <q-img class="cursor-pointer" style="width: 200px;" :src="image" @click="selectImage(image)" />
            <q-btn class="remove-button" round flat size="xm" color="primary" @click="deleteImage(image)" icon="delete" />
          </div>
        </q-card-section>
        <q-card-section>
          <div class="row">
            <q-btn :loading="loading" @click="getImages" v-if="nextToken" color="primary">{{$t('images.own.more')}}</q-btn>
          </div>
        </q-card-section>

        <q-card-section>
            <q-input type="text" :label="$t('images.own.caption')" v-model="caption"></q-input>
        </q-card-section>
        <q-card-section>
            <firebase-uploader :path-prefix="pathPrefix" @added="uploadImage" @removed="imageRemoved" @uploaded="uploadImage" :label="$t('images.own.input')" ref="uploader"></firebase-uploader>
        </q-card-section>
      </q-card>
</template>

<script lang="ts">
import { onMounted, ref } from 'vue'
import firebase from 'firebase/app'
import 'firebase/storage'
import FirebaseUploader from './FirebaseUploader'
import { useQuasar } from 'quasar'

export default {
  components: {
    FirebaseUploader
  },
  props: {
    pathPrefix: String
  },
  emits: ['command', 'selected', 'cancel'],
  setup (props, { emit }) {
    // data
    const command = ref(null)
    const images = ref<string[]>([])
    const pendingImages = ref(false)
    const $q = useQuasar()
    const caption = ref('')
    const nextToken = ref(null)
    const storageRef = firebase.storage().ref()
    const listRef = storageRef.child('media')
    const loading = ref(false)

    // methods
    const setCommand = (command) => {
      command.value = command
    }

    const selectImage = (image) => {
      const obj = {
        image: image,
        command: command.value
      }
      const img = {
        url: image,
        caption: caption.value
      }
      emit('command', obj)
      emit('selected', img)
    }
    const getImages = async () => {
      loading.value = true
      const page = await listRef.list({
        maxResults: 6,
        pageToken: nextToken.value
      })
      console.log('page', page)
      // Use the result.
      // processItems(firstPage.items)
      const items = page.items
      // processPrefixes(firstPage.prefixes)
      if (items.length === 0) {
        images.value = []
      }

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      items.forEach(async (itemRef) => {
        // All the items under listRef.
        console.log('itemRef', itemRef)
        await itemRef.getDownloadURL().then(function (url) {
          console.log('url', url)
          images.value?.push(url)
        })
      })

      nextToken.value = page.nextPageToken
      loading.value = false
    }

    onMounted(async () => {
      await getImages()
    })

    // const imageAdded = () => {
    //   pendingImages.value = true
    // }

    const imageRemoved = () => {
      pendingImages.value = false
    }

    const uploadImage = async () => {
      await getImages()
    }

    const deleteImage = (image) => {
      const refFromUrl = firebase.storage().refFromURL(image)
      refFromUrl.delete().then(async () => {
        await getImages()
      })
        .catch(err => $q.notify(err))
    }

    return {
      images,
      selectImage,
      setCommand,
      open,
      // imageAdded,
      imageRemoved,
      uploadImage,
      deleteImage,
      caption,
      getImages,
      nextToken,
      loading
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

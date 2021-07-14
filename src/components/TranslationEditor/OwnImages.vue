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
      const storageRef = firebase.storage().ref()
      const listRef = storageRef.child('media')
      await listRef.listAll()
        .then((res) => {
          if (res.items.length === 0) {
            images.value = []
          }
          res.prefixes.forEach((folderRef) => {
            // All the prefixes under listRef.
            // You may call listAll() recursively on them.
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            folderRef.listAll()
              .then(function (res) {
                const imagesTemp = []
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                res.items.forEach(async (itemRef) => {
                  // All the items under listRef.
                  await itemRef.getDownloadURL().then(function (url) {
                    images.value.push(url)
                  })
                })
                images.value = imagesTemp
              })
          })
          res.items.forEach((/* itemRef */) => {
            // All the items under listRef.
          })
        }).catch((error) => {
          // Uh-oh, an error occurred!
          console.error(error)
        })
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

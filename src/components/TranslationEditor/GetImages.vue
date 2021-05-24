<template>
    <q-dialog v-model="open" persistent>
      <q-card style="width: 80%">
        <q-card-section>
          <div class="text-h6">Elige una imagen</div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <div class="image-wrapper" v-for="(image, index) in images" :key="index">
            <q-img class="cursor-pointer" style="width: 200px;" :src="image" @click="selectImage(image)" />
            <q-btn class="remove-button" round flat size="xm" color="primary" @click="deleteImage(image)" icon="delete" />
          </div>
        </q-card-section>

        <q-card-section>
            <firebase-uploader :path-prefix="pathPrefix" @added="uploadImage" @removed="imageRemoved" @uploaded="uploadImage" label="Subir imagen" ref="uploader"></firebase-uploader>
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancelar" @click="$emit('cancel')" />
        </q-card-actions>
      </q-card>
    </q-dialog>
</template>

<script lang="ts">
import { onMounted, ref, watch, onBeforeUnmount } from 'vue'
import firebase from 'firebase/app'
import 'firebase/storage'
import FirebaseUploader from './FirebaseUploader'

export default {
  components: {
    FirebaseUploader
  },
  props: {
    prompt: Boolean,
    pathPrefix: String
  },
  emits: ['command', 'selected', 'cancel'],
  setup (props, { emit }) {
    // data
    const command = ref(null)
    const images = ref<string[]>([])
    const open = ref(false)
    const pendingImages = ref(false)

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
      emit('selected', image)
    }
    const getImages = async () => {
      const storageRef = firebase.storage().ref()
      const listRef = storageRef.child('media')
      console.log('getImages called')
      await listRef.listAll()
        .then((res) => {
          console.log('res', res)
          if (res.items.length === 0) {
            console.log('reset images')
            images.value = []
          }
          res.prefixes.forEach((folderRef) => {
            // All the prefixes under listRef.
            // You may call listAll() recursively on them.
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            folderRef.listAll()
              .then(function (res) {
                console.log(res)
                const imagesTemp = []
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                res.items.forEach(async (itemRef) => {
                  // All the items under listRef.
                  await itemRef.getDownloadURL().then(function (url) {
                    images.value.push(url)
                  })
                })
                console.log('images', imagesTemp)
                images.value = imagesTemp
              })
          })
          res.items.forEach((itemRef) => {
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

    watch(() => props.prompt,
      async () => {
        await getImages()
        open.value = props.prompt
      }
    )

    // const imageAdded = () => {
    //   pendingImages.value = true
    // }

    const imageRemoved = () => {
      pendingImages.value = false
    }

    const uploadImage = async (file) => {
      console.log('uploadImage', file)
      await getImages()
    }

    const deleteImage = (image) => {
      console.log('delete', image)
      const refFromUrl = firebase.storage().refFromURL(image)
      refFromUrl.delete().then(async () => {
        await getImages()
      })
        .catch(err => this.$notify(err))
    }

    return {
      images,
      selectImage,
      setCommand,
      open,
      // imageAdded,
      imageRemoved,
      uploadImage,
      deleteImage
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

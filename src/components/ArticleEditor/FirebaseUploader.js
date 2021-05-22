
import { createUploaderComponent } from 'quasar'
import { computed, ref } from 'vue'
import firebase from 'firebase/app'
import 'firebase/storage'
import uuid from 'uuid/v4'

export default createUploaderComponent({
  name: 'FirebaseUploader',
  props: {
    metadata: Object
  },
  emits: ['upload'],

  injectPlugin ({ emit }) {
    // can call any other composables here
    // as this function will run in the component's setup()
    const loading = ref(false)

    // [ REQUIRED! ]
    // We're working on uploading files
    const isUploading = computed(() => {
      return loading.value
    })

    // [ optional ]
    // Shows overlay on top of the
    // uploader signaling it's waiting
    // on something (blocks all controls)
    // const isBusy = computed(() => {
    //   // return <Boolean>
    // })

    // [ REQUIRED! ]
    // Abort and clean up any process
    // that is in progress
    function abort () {
      // ...
    }

    // [ REQUIRED! ]
    // Start the uploading process
    function upload () {
      this.files.forEach(file => {
        const ref = `media/${uuid()}`
        const uploadTask = firebase
          .storage()
          .ref()
          .child(ref)
          .put(file, this.metadata)

        uploadTask.on(
          'state_changed',
          sp => {
            loading.value = true
            this.uploadSize = sp.totalBytes
            this.uploadedSize = sp.bytesTransferred
          },
          null,
          () => {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {
              emit('upload', {
                url: downloadURL,
                id: ref,
                name: file.name,
                size: file.size,
                uploadedDate: new Date(),
                lastModified: file.lastModified,
                description: ''
              })
              loading.value = false
              this.removeFile(file)
            })
          }
        )
      })
    }

    return {
      isUploading,
      // isBusy,

      abort,
      upload
    }
  }
})

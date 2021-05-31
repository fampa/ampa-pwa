<template>
    <q-dialog v-model="open" persistent>
      <q-card style="width: 80%">
        <q-card-section>
          <div class="text-h6">Envia un missatge</div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-input outlined ref="title" v-model="message.title"  :placeholder="$t('content.title')" :rules="[val => !!val || $t('forms.required')]" />
          <!-- <q-input outlined ref="content" type="textarea" v-model="message.content"  :placeholder="$t('content.content')" :rules="[val => !!val || $t('forms.required')]" /> -->
          <content-editor v-model="message.content" />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancelar" @click="cancel" />
          <q-btn color="primary" label="Envia" @click="sendMessage" />
        </q-card-actions>
      </q-card>
    </q-dialog>
</template>

<script lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'
import ContentEditor from 'src/components/TranslationEditor/ContentEditor.vue'

export default {
  props: {
    prompt: Boolean
  },
  components: {
    ContentEditor
  },
  emits: ['send', 'cancel'],
  name: 'SendMessage',
  setup (props, { emit }) {
    // data
    const open = ref(props.prompt)

    const message = ref({
      title: '',
      content: ''
    })

    // methods
    onBeforeUnmount(() => {
      open.value = false
    })

    const cancel = () => {
      emit('cancel')
      open.value = false
    }

    const sendMessage = () => {
      emit('send', message.value)
      open.value = false
    }

    watch(() => props.prompt,
      () => {
        open.value = props.prompt
      }
    )

    return {
      open,
      message,
      sendMessage,
      cancel
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

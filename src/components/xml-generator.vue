<template>
    <q-dialog v-model="open" persistent>
      <q-card style="width: 80%">
        <q-card-section>
          <div class="text-h6">Genera remesa <q-badge color="accent">beta</q-badge></div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-input outlined v-model="remesa.concept"  :placeholder="$t('remesa.concept')" :rules="[val => !!val || $t('forms.required')]" />
          <q-input type="number" step="0.01" outlined v-model="remesa.amount"  :placeholder="$t('remesa.amount')" :rules="[val => !!val || $t('forms.required')]" />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancelar" @click="cancel" />
          <q-btn color="primary" :label="$t('remesa.generate')" :disable="!remesa.amount || !remesa.concept" @click="generateXml" />
        </q-card-actions>
      </q-card>
    </q-dialog>
</template>

<script lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'

export default {
  props: {
    prompt: Boolean
  },
  emits: ['generate', 'cancel'],
  name: 'generateXml',
  setup (props, { emit }) {
    // data
    const open = ref(props.prompt)

    const remesa = ref({
      concept: '',
      amount: 0
    })

    // methods
    onBeforeUnmount(() => {
      open.value = false
    })

    const cancel = () => {
      emit('cancel')
      open.value = false
    }

    const generateXml = () => {
      emit('generate', remesa.value)
      open.value = false
    }

    watch(() => props.prompt,
      () => {
        open.value = props.prompt
      }
    )

    return {
      open,
      remesa,
      generateXml,
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

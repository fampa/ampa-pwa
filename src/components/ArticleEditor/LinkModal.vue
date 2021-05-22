<template>

    <q-dialog v-model="open" persistent>
      <q-card style="width: 80%">
        <q-card-section>
          <div class="text-h6">Añade un enlace</div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-input placeholder="https://" v-model="href" label="url" />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat color="primary"  label="Cancelar" @click="$emit('cancel')" />
          <q-btn flat color="primary"  @click="selectLink('remove')" label="Quitar" />
          <q-btn color="primary" label="Establecer" @click="selectLink" />
        </q-card-actions>
      </q-card>
    </q-dialog>
</template>

<script>

export default {
  created () {
    if (this.link) {
      this.href = this.link
    }
  },

  props: {
    prompt: Boolean,
    link: String
  },
  data () {
    return {
      href: null,
      command: null,
      open: this.$props.prompt
    }
  },
  methods: {
    setCommand (command, attr) {
      // console.log(attr.href)
      // Add the sent command
      if (attr.href) {
        this.href = attr.href
      }
      this.command = command
    },
    selectLink (action) {
      if (action === 'remove') {
        this.href = null
      }
      const obj = {
        href: this.href,
        command: this.command
      }
      this.$emit('command', obj)
    }
  }
}
</script>

<style>
</style>

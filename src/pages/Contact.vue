<template>
  <q-page padding class="bg-grey-2  q-pa-md">
    <div class="max-600">
      <h1 class="text-h4">{{$t('contact.title')}}</h1>
      <q-form ref="memberForm" @submit.prevent="submitForm">
        <q-input outlined v-model="contact.firstName" :label="$t('contact.firstName')" :rules="[val => !!val || $t('forms.required')]" />
        <q-input outlined v-model="contact.lastName" :label="$t('contact.lastName')" />
        <br>
        <q-input type="email" outlined v-model="contact.email" :label="$t('contact.email')" :rules="[val => !!val || $t('forms.required'),  val => validateEmail(val) || $t('forms.validEmail')]" />
        <q-input type="phone" outlined v-model="contact.phone" :label="$t('contact.phone')" :rules="[val => (val === '' || validatePhone(val)) || $t('forms.validPhone')]" />
        <q-input outlined v-model="contact.subject" :label="$t('contact.subject')" :rules="[val => !!val || $t('forms.required')]" />
        <q-input type="textarea" outlined v-model="contact.message" :label="$t('contact.message')" :rules="[val => !!val || $t('forms.required')]" />
        <br>
        <q-btn :loading="loading" color="primary" type="submit">{{$t('forms.save')}}</q-btn>
      </q-form>
    </div>
  </q-page>
</template>

<script lang="ts">
import { ref, computed } from 'vue'
import { MembersService } from 'src/services/members'
import { useStore } from 'src/services/store'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { validatePhone, validateEmail } from 'src/utilities/validations'

export default {
  name: 'ContactPage',
  setup () {
    const membersService = new MembersService()
    const store = useStore()
    const $q = useQuasar()
    const userId = computed(() => store.state.user.user?.uid)
    const i18n = useI18n()

    // Data
    const contact = ref({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    })

    const loading = ref(false)

    // Methods
    if (userId.value) {
      const { result, onResult } = membersService.getById(userId.value)
      onResult(() => {
        const user = result.value?.members_by_pk
        contact.value.firstName = user.firstName
        contact.value.lastName = user.lastName
        contact.value.email = user.email
        contact.value.phone = user.phone
      })
    }

    const submitForm = async () => {
      loading.value = true
      const mailObj = {
        name: `${contact.value?.firstName} ${contact.value?.lastName}`,
        from: contact.value?.email,
        phone: contact.value?.phone,
        subject: contact.value?.subject,
        message: contact.value?.message

      }
      await membersService.contact(mailObj)
        .then(() => {
          loading.value = false
          $q.notify({
            message: i18n.t('contact.messageSent')
          })
        })
        .catch(err => {
          console.error(err)
          loading.value = false
          $q.notify({
            type: 'negative',
            message: err.message
          })
        })
    }

    return {
      contact,
      validatePhone,
      validateEmail,
      submitForm,
      loading
    }
  }

}
</script>

<style>

</style>

<template>
  <q-page padding class="bg-grey-2  q-pa-md">
    <div class="max-600">
    <initial-steps v-if="user && loggedInMember && !loggedInMember.family?.manualPayment && !loggedInMember.family?.signatureDate" :member="loggedInMember"></initial-steps>
      <h1 class="text-h4">{{$t('member.paymentData')}}</h1>
      <div v-if="getMemberLoading">
        <q-skeleton height="50px" square />
      </div>
      <q-banner v-else-if="member && !id" class="bg-red text-white">
        {{$t('member.familyDataNotice')}}
        <template v-slot:action>
          <q-btn flat color="white" :label="$t('member.familyDataNoticeBtn')" :to="'/user/family'" />
        </template>
      </q-banner>
      <div v-else-if="member && id">
      <q-list>
        <q-item tag="label" v-ripple>
          <q-item-section avatar>
            <q-radio v-model="manualPayment" :val="true" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Ingrés o transferència</q-item-label>
            <q-item-label caption>{{$t('member.ampaIban', {iban: AMPA_IBAN})}}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item tag="label" v-ripple>
          <q-item-section avatar>
            <q-radio v-model="manualPayment" :val="false" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Domiciliació bancària</q-item-label>
            <q-item-label caption>{{$t('steps.iban.description')}} </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
      <section v-if="!manualPayment">
        <q-input mask="ES## #### #### #### #### ####" outlined v-model.trim="iban" label="IBAN" placeholder="ES" :rules="[val => !!val || $t('forms.required'), val => validateIban(val.replace(/\s/g, '')) || $t('forms.validIBAN')]">
          </q-input>
          <br>
          <p  v-if="member.family?.signatureDate">{{$t('forms.ibanNotice')}}</p>
          <p  v-if="member.family?.mandateId && !member.family?.signatureDate">{{$t('forms.needSignature')}}</p>
          <q-btn :loading="loading" :disable="!iban" color="primary" :label="$t('forms.sendMandate')" @click="updateIban"/>
      </section>
      <section v-if="manualPayment">
        <q-btn :loading="loading" color="primary" :label="$t('forms.save')" @click="updateFamily"/>
      </section>
      <section v-if="isAdmin && !manualPayment">
        <h3>ADMIN</h3>
        <q-input outlined :label="$t('forms.signatureDate')" v-model="signatureDate" mask="date" >
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date v-model="signatureDate">
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Close" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
          <br>
          <q-btn :loading="loading" color="accent" :label="$t('forms.save')" @click="updateFamily"/>

      </section>
        <br>
        <br>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { MembersService } from 'src/services/members'
import { useRoute, useRouter } from 'vue-router'
import { computed, reactive, toRefs, ref, onMounted } from 'vue'
import firebase from 'firebase/app'
import 'firebase/auth'
import { Family } from 'src/models/Family'
// import { cleanObject } from 'src/utilities/cleanObject'
import { useQuasar, date } from 'quasar'
import { useI18n } from 'vue-i18n'
import { validateIban } from 'src/utilities/validations'
import { useStore } from 'src/services/store'
import InitialSteps from 'components/InitialSteps.vue'
import { Member } from 'src/models/Member'

export default {
  name: 'PagePayment',
  components: {
    InitialSteps
  },
  setup () {
    const membersService = new MembersService()
    const route = useRoute()
    const router = useRouter()
    const $q = useQuasar()
    const i18n = useI18n()
    const store = useStore()
    const isAdmin = computed(() => store.state.user.isAdmin)
    const loggedInMember = store.state.user.member

    const familyData = reactive<Family>({
      id: undefined,
      iban: undefined,
      manualPayment: undefined,
      signatureDate: undefined
    })

    const memberData = ref<Member>(null)

    const user = computed(() => {
      return firebase.auth().currentUser
    })

    const AMPA_IBAN = computed(() => {
      return process.env.AMPA_IBAN
    })

    const timeCheck = computed(() => {
      const created = Number(route.query?.t)
      const unit = 'hours'
      const today = Date.now()
      const diff = date.getDateDiff(today, created, unit)
      return diff
    })

    const id = computed(() => {
      const params = route.params?.id?.toString()
      if (params) {
        return params
      } else {
        return user.value?.uid
      }
    })

    const { member, loading: getMemberLoading, onResult, onError: onGetMemberError, refetch } = membersService.getById(id.value)
    const { mutate, loading: mutateLoading, onError } = membersService.updateFamily()

    const loading = ref<boolean>(false)

    const updateFamily = async () => {
      loading.value = true
      try {
        await mutate({
          id: familyData.id,
          family: {
            manualPayment: familyData.manualPayment,
            signatureDate: familyData.signatureDate || null
          }
        })
          .then(() => store.dispatch('user/setMember', member.value?.id))
          .then(() => {
            $q.notify({
              type: 'info',
              message: i18n.t('forms.savedOk'),
              actions: [
                {
                  label: i18n.t('notification.close'),
                  color: 'white',
                  attrs: {
                    'aria-label': 'Dismiss'
                  }
                }
              ]
            })
          })
        await refetch()
      } catch (error) {
        onError(error)
      } finally {
        loading.value = false
      }
    }

    onResult(() => {
      memberData.value = member.value
      familyData.id = member.value?.familyId
      familyData.iban = member.value?.family?.iban || ''
      familyData.manualPayment = member.value?.family?.manualPayment || false
      familyData.signatureDate = member.value?.family?.signatureDate || null
    })

    const updateIban = async () => {
      if (!validateIban(familyData.iban?.replace(/\s/g, ''))) return
      loading.value = true
      await mutate({ id: familyData.id, family: { iban: familyData.iban.replace(/\s/g, '') } })
        .then(async () => await refetch())
        .then(async () => {
          const id = familyData.id
          const language = i18n.locale
          await membersService.sendMandateMail(id, member.value, language.value)
            .then(async () => {
              loading.value = false
              $q.notify({
                timeout: 0,
                type: 'info',
                message: i18n.t('forms.sendMandateMessage', { email: member.value?.email }),
                actions: [
                  {
                    label: i18n.t('notification.close'),
                    color: 'white',
                    attrs: {
                      'aria-label': 'Dismiss'
                    }
                  }
                ]
              })
              await refetch()
            })
        })
        .catch(err => {
          console.error(err)
          loading.value = false
        })
    }

    onMounted(async () => {
      if (route.query && route.query.t && route.query.c) {
        const member = computed(() => store.state.user?.member)
        if (member.value?.family?.signatureDate) return
        loading.value = true
        if (timeCheck.value < 24) {
          console.log('make signature')
          const code = route.query.c as string
          await membersService.signMandate(member.value?.familyId, member.value, code, i18n.locale.value)
            .then(async () => {
              $q.notify({
                timeout: 0,
                type: 'info',
                message: i18n.t('forms.mandateSigned'),
                actions: [
                  {
                    label: i18n.t('notification.close'),
                    color: 'white',
                    attrs: {
                      'aria-label': 'Dismiss'
                    }
                  }
                ]
              })
              await refetch()
              loading.value = false
            })
            .catch(err => {
              console.error(err)
              loading.value = false
              const error = err.response?.data?.error
              $q.notify({
                timeout: 0,
                type: 'negative',
                message: error,
                actions: [
                  {
                    label: i18n.t('notification.close'),
                    color: 'white',
                    attrs: {
                      'aria-label': 'Dismiss'
                    }
                  }
                ]
              })
            })
        } else {
          loading.value = false
          $q.notify({
            timeout: 0,
            type: 'negative',
            message: i18n.t('forms.needNewMandate'),
            actions: [
              {
                label: i18n.t('notification.close'),
                color: 'white',
                attrs: {
                  'aria-label': 'Dismiss'
                }
              }
            ]
          })
        }
      }
    })

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    onError(async (error) => {
      console.error(error)
      await router.push('/')
    })

    onGetMemberError(() => window.location.reload())

    return {
      loading,
      getMemberLoading,
      member,
      memberData,
      user,
      ...toRefs(familyData),
      updateIban,
      validateIban,
      mutateLoading,
      timeCheck,
      AMPA_IBAN,
      updateFamily,
      loggedInMember,
      isAdmin
    }
  }
}
</script>

<style>
</style>

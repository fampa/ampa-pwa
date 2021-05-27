<template>
    <div class="max-600" v-if="service">
      <div class="row justify-between">
        <div class="col-md-6 q-pa-md">
          <p>{{formatCurrency(service.price)}}</p>
          <p>{{$t('service.edit.participants')}}: {{Number(participants)}} de {{Number(service.spots)}}</p>
          <q-linear-progress :value="Number(participants)/Number(service.spots)" class="q-mt-md" />
          <p v-if="!user" class="text-caption">{{$t('member.needLogin')}}: <router-link :to="`/login?next=${route.path}`">{{$t('login')}}</router-link></p>
          <p v-if="user && member?.family?.iban == null" class="text-caption">{{$t('member.needPayment')}}: <router-link to="/user/payment">{{$t('member.paymentData')}}</router-link></p>
        </div>
        <div class="col-md-6">
          <div v-if="member?.family">
            <ul>
              <li class="q-pa-md" v-for="(child, index) in member.family.children" :key="index">
                <q-btn
                  v-if="child.hiredServices.find((h) => h.service.id === service.id)"
                  color="accent"
                  :disable="!user || member?.family?.iban === (null || undefined || '')"
                  @click="remove(child.id)"
                  :loading="loading"
                >
                  {{$t('service.edit.remove', { name: child.firstName})}}
                </q-btn>
                <q-btn
                  v-else
                  color="primary"
                  :disable="!user || member?.family?.iban === (null || undefined || '') || (Number(service.spots) === 0) || (Number(participants)/Number(service.spots) === 1)"
                  @click="join(child)"
                  :loading="loading"
                >
                  {{$t('service.edit.join', { name: child.firstName})}}
                </q-btn>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <!-- is admin -->
      <div v-if="member?.isAdmin" class="row">
        <div id="participants">
        <h2 class="text-h5">{{$t('service.edit.participants')}}</h2>
        <ul>
          <li v-for="(participant, index) in service.participants" :key="index">
            {{participant.child.firstName}} {{participant.child.lastName}} ({{participant.child.birthDate}}) <q-btn flat round color="red" icon="las la-trash" @click="remove(participant.childId)" />
          </li>
        </ul>
      </div>
      </div>
    </div>
</template>

<script lang="ts">
import { ContentsService } from 'src/services/contents'
import { useRoute } from 'vue-router'
import { computed, ref, defineComponent, PropType } from 'vue'
import { useQuasar } from 'quasar'
import { formatCurrency } from 'src/utilities/formatCurrency'
import { MembersService } from 'src/services/members'
import { Member } from 'src/models/Member'
import firebase from 'firebase/app'
import 'firebase/auth'
import { useI18n } from 'vue-i18n'
import { Child } from 'src/models/Child'
import { Content } from 'src/models/Content'

export default defineComponent({
  name: 'PageServei',
  props: {
    service: {
      type: Object as PropType<Content>,
      required: true
    }
  },
  emits: ['refetch'],
  setup (props, { emit }) {
    const contentsService = new ContentsService()
    const membersService = new MembersService()
    const route = useRoute()
    const id = computed(() => Number(route.params.id))
    const $q = useQuasar()
    const i18n = useI18n()

    const user = ref<firebase.User | null>(null)
    const member = ref<Member | null>(null)
    const loading = ref(false)

    const participants = computed(() => props.service.participants?.length)

    // const { result, loading: serviceLoading, error, onResult, onError, refetch: refetchService } = contentsService.getContentById(id.value)

    // onResult(() => {
    //   service.value = result.value?.content_by_pk
    // })

    const { mutate: joinMutation } = contentsService.joinService()

    const join = async (child: Child) => {
      loading.value = true
      await joinMutation({
        childId: child.id,
        serviceId: id.value
      })
        .then(async () => {
          getUserData()
          // await refetchService()
          emit('refetch')
          await contentsService.serviceMessage({
            from: member.value.email,
            message: `<p>El xiquet/a ${child.firstName} ${child.lastName} (${child.birthDate})  ha contractat el servei <a href="https://${process.env.FIREBASE_PROJECT_ID}.web.app${route.path}" target="_blank">${props.service.translations.find(t => t.language === i18n.locale.value).title}</a></p>`
          })
        })
        .then(() => {
          $q.notify(i18n.t('forms.savedOk'))
          loading.value = false
        })
        .catch(err => {
          console.error(err)
          loading.value = false
        })
    }

    const { mutate: unJoinMutation } = contentsService.unJoinService()

    const remove = async (childId: number) => {
      loading.value = true
      console.log(childId)
      await unJoinMutation({
        childId,
        serviceId: id.value
      })
        .then(() => {
          getUserData()
          // await refetchService()
          emit('refetch')
          loading.value = false
          $q.notify(i18n.t('forms.savedOk'))
        })
        .catch(err => {
          console.error(err)
          loading.value = false
        })
    }

    const getUserData = () => {
      const { result: memberResult, onResult: onMemberResult } = membersService.getById(user.value?.uid)
      onMemberResult(() => {
        member.value = memberResult.value?.members_by_pk
      })
    }

    firebase.auth().onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        user.value = firebaseUser
        getUserData()
      } else {
        user.value = null
      }
    })

    return {
      loading,
      formatCurrency,
      user,
      member,
      route,
      join,
      remove,
      participants
    }
  }
})
</script>

<style scoped>
li{
  list-style: none;
}
</style>

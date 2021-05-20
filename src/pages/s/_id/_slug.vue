<template>
  <q-page padding class="bg-grey-2 q-pa-md">
    <div class="max-600" v-if="service">
      <h1 class="text-h4">{{service.name}}</h1>
      <q-img :src="service.image"></q-img>
      <br>
      <div class="row justify-between">
        <div class="col-md-6 q-pa-md">
          <p>{{service.description}}</p>
          <p>{{formatCurrency(service.price)}}/{{service.periodicity}}</p>
          <p>{{$t('service.edit.participants')}}: {{Number(participants)}} de {{Number(service.spots)}}</p>
          <q-linear-progress :value="Number(participants)/Number(service.spots)" class="q-mt-md" />
          <p v-if="!user" class="text-caption">{{$t('member.needLogin')}}: <router-link :to="`/login?next=${route.path}`">{{$t('login')}}</router-link></p>
      <p v-if="user && member?.family?.iban === (null || undefined || '')" class="text-caption">{{$t('member.needPayment')}}: <router-link to="/user/payment">{{$t('member.paymentData')}}</router-link></p>
        </div>
        <div class="col-md-6">
          <div v-if="member?.family">
            <ul>
              <li class="q-pa-md" v-for="(child, index) in member.family.children" :key="index">
                {{}}
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
                  :disable="!user || member?.family?.iban === (null || undefined || '') || (Number(participants)/Number(service.spots) === 1)"
                  @click="join(child.id)"
                  :loading="loading"
                >
                  {{$t('service.edit.join', { name: child.firstName})}}
                </q-btn>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { ContentsService } from 'src/services/contents'
import { useRoute } from 'vue-router'
import { computed, ref } from 'vue'
import { useQuasar } from 'quasar'
import { Service } from 'src/models/Service'
import { formatCurrency } from 'src/utilities/formatCurrency'
import { MembersService } from 'src/services/members'
import { Member } from 'src/models/Member'
import firebase from 'firebase/app'
import 'firebase/auth'
import { useI18n } from 'vue-i18n'

export default {
  name: 'PageServei',
  setup () {
    const contentsService = new ContentsService()
    const membersService = new MembersService()
    const route = useRoute()
    const id = computed(() => Number(route.params.id))
    const $q = useQuasar()
    const i18n = useI18n()

    const user = ref<firebase.User | null>(null)
    const member = ref<Member | null>(null)
    const loading = ref(false)
    const service = ref<Service | null>(null)

    const participants = computed(() => service.value?.participants?.length)

    const { result, loading: serviceLoading, error, onResult, onError, refetch: refetchService } = contentsService.getServiceById(id.value)

    onResult(() => {
      service.value = result.value?.services_by_pk
    })

    const { mutate: joinMutation } = contentsService.joinService()

    const join = async (childId: number) => {
      console.log('joined', childId)
      loading.value = true
      await joinMutation({
        childId,
        serviceId: id.value
      })
        .then(async () => {
          getUserData()
          await refetchService()
          loading.value = false
          $q.notify(i18n.t('forms.savedOk'))
        })
        .catch(err => {
          console.error(err)
          loading.value = false
        })
    }

    const { mutate: unJoinMutation } = contentsService.unJoinService()

    const remove = async (childId: number) => {
      console.log('removed', childId)
      loading.value = true
      await unJoinMutation({
        childId,
        serviceId: id.value
      })
        .then(async () => {
          getUserData()
          await refetchService()
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

    onError(() => {
      $q.notify({
        type: 'negative',
        message: error.value?.message
      })
    })

    return {
      loading,
      serviceLoading,
      service,
      formatCurrency,
      user,
      member,
      route,
      join,
      remove,
      participants
    }
  }
}
</script>

<style>
li{
  list-style: none;
}
</style>

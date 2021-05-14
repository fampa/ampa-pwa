<template>
  <q-page padding class="bg-grey-2">
    <div class="q-gutter-md max-600">
      <h1 class="text-h4">{{$t('member.familyData')}}</h1>
      <div v-if="!member && isLoading">
        <q-skeleton height="50px" square />
      </div>
      <q-banner v-else-if="!nif" class="bg-red text-white">
        {{$t('member.userDataNotice')}}
        <template v-slot:action>
          <q-btn flat color="white" :label="$t('member.userDataNoticeBtn')" :to="'/user'" />
        </template>
      </q-banner>
      <div v-else>
        <q-banner class="bg-accent text-white" v-if="hasRequestedJoinFamily">
          <template v-slot:avatar>
          <q-icon name="info" color="white" />
        </template>
          {{$t('family.hasRequestedJoinNotice')}}
          <template v-slot:action>
            <q-btn flat color="white" :label="$t('family.requestJoinNoticeAbort')" @click="abortJoin()" />
          </template>
        </q-banner>

        <q-banner class="bg-accent text-white" v-if="joinFamilyRequest">
          <template v-slot:avatar>
          <q-icon name="info" color="white" />
        </template>
          {{$t('family.requestJoinNotice', {email: joinFamilyRequest.email})}}
          <template v-slot:action>
            <q-btn :loading="isLoading" flat color="white" :label="$t('family.requestJoinNoticeDecline')" @click="rejectJoin()" />
            <q-btn :loading="isLoading" flat color="white" :label="$t('family.requestJoinNoticeAccept')" @click="resolveJoin()" />
          </template>
        </q-banner>

          <q-input outlined v-model="name" :label="$t('member.familyName')" bottom-slots>
            <template v-slot:hint>
            {{$t('family.putChildrenLastName')}}
          </template>
          </q-input>
          <br>
          <q-btn v-if="!id" :loading="isLoading" color="primary" :label="$t('forms.save')" @click="prepareUpdateFamily"/>
          <div v-if="id">
            <h2 class="text-h4">
              {{$t('member.children')}}
              <q-btn class="float-right" color="primary" flat label="+ Afegeix" @click="addChild" />
            </h2>
            <q-form v-if="children" ref="mForm" @submit.prevent="submitForm">
            <div v-for="child in children" :key="child.id">
              <q-input outlined v-model="child.firstName" :label="$t('member.firstName')" :rules="[val => !!val || $t('forms.required')]" />
              <q-input outlined v-model="child.lastName" :label="$t('member.lastName')" :rules="[val => !!val || $t('forms.required')]" />
              <q-input outlined v-model="child.birthDate" mask="####-##-##" :rules="[val => datePattern.test(val) || $t('forms.validDate'), val => !!val || $t('forms.required')]" :label="$t('member.birthDate')">
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                      <q-date v-model="child.birthDate">
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup label="Close" color="primary" flat />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
              <br>
              <q-separator/>
              <br>
            </div>
            <q-btn :loading="isLoading" :disable="children.length === 0" color="primary" :label="$t('forms.save')" type="submit" />
          </q-form>

        </div>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { useRoute } from 'vue-router'
import { MembersService } from 'src/services/members'
import { computed, ref, reactive, toRefs, watch } from 'vue'
import firebase from 'firebase/app'
import 'firebase/auth'
import { Child, ChildrenData } from 'src/models/Child'
import type { QForm } from 'quasar'
import { Family } from 'src/models/Family'
import { useQuasar } from 'quasar'
import { cleanObject } from 'src/utilities/cleanObject'
import { Member } from 'src/models/Member'
import { useI18n } from 'vue-i18n'

export default {
  name: 'PagePersonalData',
  setup () {
    // utilities and initializations
    const $q = useQuasar()
    const i18n = useI18n()
    const membersService = new MembersService()
    const route = useRoute()
    const datePattern = /^-?[\d]+-[0-1]\d-[0-3]\d$/

    // Reactive data
    const familyData = reactive<Family>({
      id: undefined,
      name: '',
      iban: undefined,
      ownerId: undefined
    })

    const memberData = reactive<Member>({
      familyId: undefined,
      nif: undefined,
      hasRequestedJoinFamily: false,
      joinFamilyRequest: undefined
    })

    const childrenData = reactive<ChildrenData>({
      children: []
    })

    const shouldUpdateFamilyName = ref(false)

    const mForm = ref<QForm | null>(null)

    const currentUserId = computed(() => {
      return firebase.auth().currentUser?.uid
    })

    const id = computed(() => {
      const params = route.params?.id?.toString()
      if (params) {
        return params
      } else {
        return currentUserId.value || ''
      }
    })

    //
    // load data
    //
    const { member, loading, error, onResult, refetch: refetchMemberData } = membersService.getById(id.value)

    onResult(() => {
      familyData.id = member.value?.familyId
      familyData.name = member.value?.family?.name
      familyData.ownerId = member.value?.family?.ownerId
      memberData.familyId = member.value?.familyId
      memberData.nif = member.value?.nif
      memberData.hasRequestedJoinFamily = member.value?.hasRequestedJoinFamily
      memberData.joinFamilyRequest = member.value?.joinFamilyRequest
      const childrenTemp = member.value?.family?.children?.map(child => {
        const tempChild: Child = { ...child }
        return tempChild
      })
      childrenData.children = childrenTemp || []
      // console.log(childrenData)
    })

    const { mutate: mutateFamily, loading: upsertFamilyLoading, error: upsertFamilyError, onError: upsertFamilyOnError } = membersService.upsertFamily()
    const { mutate: mutateMember, loading: updateMemberLoading, error: updateMemberError, onError: updateMemberOnError } = membersService.updateMember()
    const { mutate: mutateChildren, loading: updateChildrenLoading, error: updateChildrenError, onError: updateChildrenOnError } = membersService.updateChildren()

    // Methods
    const addChild = () => {
      const child: Child = {
        firstName: '',
        lastName: '',
        birthDate: '',
        familyId: member.value?.familyId
      }
      const childrenTemp = Object.assign([], childrenData.children || []) as Child[]
      childrenTemp.push(child)
      childrenData.children = childrenTemp || []
    }

    const searchFamily = (name: string) => {
      const { families, onResult: searchHasResult } = membersService.findFamily(name)
      searchHasResult(() => {
        const items = families.value?.map((family) => {
          return { label: `${family.name || ''}. ${i18n.t('member.children')}: ${family.children?.map((child) => child.firstName).toString() || ''}`, value: family.id }
        }) || []
        items.push({ label: i18n.t('forms.selectFamilyNew'), value: undefined })
        $q.dialog({
          title: i18n.t('forms.selectFamily'),
          message: i18n.t('forms.selectFamilyMore'),
          options: {
            type: 'radio',
            model: 'opt1',
            // inline: true
            items: items
          },
          cancel: true,
          persistent: true
        }).onOk(async (data: number) => {
          if (!data) {
            await upsertFamily()
          } else {
            await requestFamilyJoin(data)
          }
        }).onCancel(() => {
        // console.log('>>>> Cancel')
        }).onDismiss(() => {
        // console.log('I am triggered on both OK and Cancel')
        })
      })
    }

    const prepareUpdateFamily = () => {
      if (!familyData.id && familyData.name) {
        return searchFamily(familyData.name)
      }
    }

    const upsertFamily = async () => {
      familyData.ownerId = member.value?.id
      const variables = cleanObject({ ...familyData })
      // console.log(variables)
      const { data } = await mutateFamily({ family: variables })
      const familyId = memberData.familyId || data?.insert_families_one?.id
      memberData.hasRequestedJoinFamily = false
      memberData.familyId = familyId
      const variablesMember = cleanObject({ ...memberData })
      await mutateMember({ id: id.value, member: { ...variablesMember } })
      familyData.id = familyId
      await refetchMemberData()
      $q.notify(i18n.t('forms.savedOk'))
    }

    const requestFamilyJoin = async (familyId: number) => {
      loading.value = true
      if (member.value) {
        await membersService.requestFamilyJoin(familyId, member.value)
        memberData.hasRequestedJoinFamily = true
        const variables = cleanObject({ ...memberData })
        await mutateMember({ id: id.value, member: { ...variables } })
        loading.value = false
        await refetchMemberData()
        $q.notify(i18n.t('forms.savedOk'))
      }
    }

    const submitForm = async (): Promise<void> => {
      // console.log('submit clicked')
      return mForm.value?.validate().then(async success => {
        if (success) {
        // yay, models are correct
          // console.log('success')
          await mutateChildren({ children: childrenData.children })
          if (shouldUpdateFamilyName.value) {
            await upsertFamily()
          }
          $q.notify(i18n.t('forms.savedOk'))
        } else {
        // oh no, user has filled in
        // at least one invalid value
          console.log('no valid')
        }
      })
    }

    const resolveJoin = async () => {
      loading.value = true
      await membersService.resolveFamilyJoin(memberData.familyId, memberData.joinFamilyRequest)
      memberData.hasRequestedJoinFamily = false
      await mutateMember({ id: id.value, member: { joinFamilyRequest: null } })
      loading.value = false
      await refetchMemberData()
      $q.notify(i18n.t('forms.savedOk'))
    }

    const rejectJoin = async () => {
      loading.value = true
      await mutateMember({ id: id.value, member: { joinFamilyRequest: null } })
      loading.value = false
      await refetchMemberData()
      $q.notify(i18n.t('forms.savedOk'))
    }

    const abortJoin = async () => {
      loading.value = true
      await mutateMember({ id: id.value, member: { hasRequestedJoinFamily: false } })
      loading.value = false
      await refetchMemberData()
      $q.notify(i18n.t('forms.savedOk'))
    }

    // Error handling
    upsertFamilyOnError(() => {
      $q.notify({
        type: 'negative',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        message: upsertFamilyError.value.message
      })
    })

    updateMemberOnError(() => {
      $q.notify({
        type: 'negative',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        message: updateMemberError.value.message
      })
    })

    updateChildrenOnError(() => {
      $q.notify({
        type: 'negative',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        message: updateChildrenError.value.message
      })
    })

    // watchers and computed properties

    const isLoading = computed(() => {
      return loading.value || updateChildrenLoading.value || upsertFamilyLoading.value || updateMemberLoading.value
    })

    watch(() => familyData.name,
      (newVal, oldVal) => {
        if (oldVal && newVal !== oldVal) {
          shouldUpdateFamilyName.value = true
        }
      })

    return {
      member,
      ...toRefs(childrenData),
      ...toRefs(familyData),
      ...toRefs(memberData),
      addChild,
      datePattern,
      error,
      submitForm,
      mForm,
      upsertFamily,
      isLoading,
      prepareUpdateFamily,
      resolveJoin,
      rejectJoin,
      abortJoin
    }
  }
}
</script>

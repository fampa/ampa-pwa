<template>
  <q-page padding class="bg-grey-2  q-pa-md">
    <div class="max-600">
      <initial-steps v-if="user && loggedInMember && !loggedInMember.family?.manualPayment && !loggedInMember.family?.signatureDate" :member="loggedInMember"></initial-steps>
      <h1 class="text-h4">{{$t('member.familyData')}}</h1>
      <div v-if="!member && isLoading">
        <q-skeleton height="50px" square />
      </div>
      <q-banner v-else-if="user && !isAdmin && !nif" class="bg-red text-white">
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
          <q-badge v-if="family?.inactive" color="red">
            {{$t('member.inactive')}}
          </q-badge>
          <q-input :disable="family?.inactive" outlined v-model="name" :label="$t('member.familyName')" bottom-slots>
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
            <q-badge v-if="child.inactive" color="red">
              {{$t('member.inactive')}}
            </q-badge>
              <q-btn rounded flat color="red" icon="delete" class="float-right" @click="deleteChild(child.id)"></q-btn>
              <q-input :disable="child.inactive" outlined v-model="child.firstName" :label="$t('member.firstName')" :rules="[val => !!val || $t('forms.required')]" />
              <q-input :disable="child.inactive" outlined v-model="child.lastName" :label="$t('member.lastName')" :rules="[val => !!val || $t('forms.required')]" />
              <q-input :disable="child.inactive" outlined v-model="child.birthDate" mask="####-##-##" :label="$t('member.birthDate')">
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
              <div class="q-pa-md">
                <div class="q-gutter-md row">
                  <q-select :disable="child.inactive" outlined v-model="child.grade" style="width: 50%" :options="GRADES" :label="$t('member.grade')" :rules="[val => (!!val || val === 0 ) || $t('forms.required')]" emit-value map-options />
                  <q-select :disable="child.inactive" outlined v-model="child.group" style="width: 25%" :options="['A', 'B', 'C', 'D']" :label="$t('member.group')" emit-value map-options />
                </div>
              </div>
              <br>
              <div v-if="child.hiredServices?.length > 0">
                <h3 class="text-h5">{{$t('family.hiredServices', { name: child.firstName })}}</h3>
                <ul>
                  <li v-for="(hiredService, index) in child.hiredServices" :key="index">
                    <router-link :to="`/${hiredService.service.type}/${hiredService.service.id}/${fallbackContent(hiredService.service, 'slug')}`">{{ fallbackContent(hiredService.service, 'title') }}</router-link>
                  </li>
                </ul>
              </div>
              <q-separator/>
              <br>
            </div>
            <q-btn :loading="isLoading" :disable="children?.length === 0" color="primary" :label="$t('forms.save')" type="submit" />
            <br>
            <section v-if="isAdmin">
              <h2>ADMIN</h2>
              <q-btn color="accent" label="Usuari responsable" :to="`/admin/users/edit/${member.id}`" />
            </section>
          </q-form>

        </div>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { useRoute, useRouter } from 'vue-router'
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
import { useStore } from 'src/services/store'
import { fallbackContent } from 'src/utilities/fallbackContent'
import InitialSteps from 'components/InitialSteps.vue'

export default {
  name: 'PagePersonalData',
  components: {
    InitialSteps
  },
  setup () {
    // utilities and initializations
    const $q = useQuasar()
    const i18n = useI18n()
    const membersService = new MembersService()
    const route = useRoute()
    const router = useRouter()
    const store = useStore()
    const user = computed(() => store.state.user.user)
    const isAdmin = computed(() => store.state.user.isAdmin)
    const datePattern = /^-?[\d]+-[0-1]\d-[0-3]\d$/
    const member = ref<Member>(null)
    const loggedInMember = store.state.user.member

    // Reactive data
    const familyData = reactive<Family>({
      id: undefined,
      name: '',
      iban: undefined,
      ownerId: undefined,
      manualPayment: undefined
    })

    const memberData = reactive<Member>({
      familyId: undefined,
      nif: undefined,
      hasRequestedJoinFamily: false,
      joinFamilyRequest: undefined,
      family: undefined
    })

    const childrenData = reactive<ChildrenData>({
      children: []
    })

    const shouldUpdateFamilyName = ref(false)

    const mForm = ref<QForm | null>(null)

    const currentUserId = computed(() => {
      return firebase.auth().currentUser?.uid
    })

    const { mutate: deleteChildMutation } = membersService.deleteChild()

    const deleteChild = async (id: number) => {
      if (!confirm(i18n.t('family.deleteChildConfirm'))) return
      const child = childrenData.children.find(c => c.id === id)
      if (!child) {
        return
      }
      const childIndex = childrenData.children.indexOf(child)
      if (childIndex === -1) {
        return
      }
      childrenData.children.splice(childIndex, 1)
      await deleteChildMutation({ id })
    }

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
    const { member: memberResult, loading, error, onError, onResult, refetch } = membersService.getById(id.value)

    onResult(() => {
      member.value = memberResult.value
      familyData.id = memberResult.value?.familyId
      familyData.name = memberResult.value?.family?.name
      familyData.ownerId = memberResult.value?.family?.ownerId
      memberData.familyId = memberResult.value?.familyId
      memberData.nif = memberResult.value?.nif
      memberData.family = memberResult.value?.family
      memberData.hasRequestedJoinFamily = memberResult.value?.hasRequestedJoinFamily
      memberData.joinFamilyRequest = memberResult.value?.joinFamilyRequest
      const childrenTemp = memberResult.value?.family?.children?.map(child => {
        const tempChild: Child = { ...child }
        return tempChild
      })
      childrenData.children = childrenTemp || []
      // console.log(childrenData)
    })

    const { mutate: mutateFamily, loading: upsertFamilyLoading, error: upsertFamilyError, onError: upsertFamilyOnError } = membersService.upsertFamily()
    const { mutate: mutateMember, loading: updateMemberLoading, error: updateMemberError, onError: updateMemberOnError } = membersService.updateMember()
    const { mutate: mutateChildren, loading: updateChildrenLoading, error: updateChildrenError, onError: updateChildrenOnError } = membersService.updateChildren()

    const GRADES = [
      {
        value: -2,
        label: i18n.t('grade.infantil1')
      },
      {
        value: -1,
        label: i18n.t('grade.infantil2')
      },
      {
        value: 0,
        label: i18n.t('grade.infantil3')
      },
      {
        value: 1,
        label: i18n.t('grade.primaria1')
      },
      {
        value: 2,
        label: i18n.t('grade.primaria2')
      },
      {
        value: 3,
        label: i18n.t('grade.primaria3')
      },
      {
        value: 4,
        label: i18n.t('grade.primaria4')
      },
      {
        value: 5,
        label: i18n.t('grade.primaria5')
      },
      {
        value: 6,
        label: i18n.t('grade.primaria6')
      }
    ]
    // Methods
    const addChild = () => {
      const child: Child = {
        firstName: '',
        lastName: '',
        birthDate: null,
        grade: null,
        group: null,
        inactive: false,
        familyId: memberData.familyId
      }
      const childrenTemp = Object.assign([], childrenData.children || []) as Child[]
      childrenTemp.push(child)
      childrenData.children = childrenTemp || []
    }

    const searchFamily = (name: string) => {
      const { families, onResult: searchHasResult } = membersService.searchFamily(name)
      searchHasResult(() => {
        if (!user.value) return
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
      // console.log('data', data)
      const familyId = memberData.familyId || data?.insert_families_one?.id
      memberData.hasRequestedJoinFamily = false
      memberData.familyId = familyId
      const variablesMember = cleanObject({ ...memberData })
      await mutateMember({ id: id.value, member: { ...variablesMember } })
        .then(() => store.dispatch('user/setMember', id.value))
      familyData.id = familyId
      $q.notify(i18n.t('forms.savedOk'))
    }

    const requestFamilyJoin = async (familyId: number) => {
      loading.value = true
      if (member.value) {
        await membersService.requestFamilyJoin(familyId, member.value)
        memberData.hasRequestedJoinFamily = true
        const variables = cleanObject({ ...memberData })
        await mutateMember({ id: id.value, member: { ...variables } })
          .then(() => store.dispatch('user/setMember', id.value))
        loading.value = false
        $q.notify(i18n.t('forms.savedOk'))
      }
    }

    const submitForm = async (): Promise<void> => {
      // console.log('submit clicked')
      return mForm.value?.validate().then(async success => {
        if (success) {
        // yay, models are correct
          // console.log('success')
          const children = childrenData?.children.map(child => {
            delete child.hiredServices
            return child
          })
          await mutateChildren({ children })
          if (shouldUpdateFamilyName.value) {
            await upsertFamily()
            // .then(() => store.dispatch('user/setMember', id.value))
          }
          $q.notify(i18n.t('forms.savedOk'))
          await refetch()
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
      $q.notify(i18n.t('forms.savedOk'))
    }

    const rejectJoin = async () => {
      loading.value = true
      await mutateMember({ id: id.value, member: { joinFamilyRequest: null } })
      loading.value = false
      $q.notify(i18n.t('forms.savedOk'))
    }

    const abortJoin = async () => {
      loading.value = true
      await mutateMember({ id: id.value, member: { hasRequestedJoinFamily: false } })
      loading.value = false
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

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    onError(async () => {
      await router.push('/')
    })

    return {
      member,
      ...toRefs(childrenData),
      ...toRefs(familyData),
      ...toRefs(memberData),
      addChild,
      memberData,
      user,
      datePattern,
      error,
      submitForm,
      mForm,
      upsertFamily,
      isLoading,
      prepareUpdateFamily,
      resolveJoin,
      rejectJoin,
      abortJoin,
      fallbackContent,
      isAdmin,
      deleteChild,
      loggedInMember,
      GRADES
    }
  }
}
</script>

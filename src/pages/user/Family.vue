<template>
  <q-page padding class="bg-grey-2">
    <h1 class="text-h4">{{$t('member.familyData')}}</h1>
    <div class="q-gutter-md" style="max-width: 300px" v-if="member">
        <q-input outlined v-model="name" :label="$t('member.familyName')" bottom-slots>
          <template v-slot:hint>
          {{$t('forms.putChildrenLastName')}}
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
import { i18n } from 'src/boot/i18n'
import { cleanObject } from 'src/utilities/cleanObject'

export default {
  name: 'PagePersonalData',
  setup () {
    // utilities and initializations
    const $q = useQuasar()
    const translate = i18n.global
    const membersService = new MembersService()
    const route = useRoute()
    const datePattern = /^-?[\d]+-[0-1]\d-[0-3]\d$/

    // Reactive data
    const familyData = reactive<Family>({
      id: undefined,
      name: '',
      iban: undefined,
      owner: undefined
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
      familyData.owner = member.value?.id
      const childrenTemp = member.value?.family?.children?.map(child => {
        const tempChild: Child = { ...child }
        return tempChild
      })
      childrenData.children = childrenTemp || []
      // console.log(childrenData)
    })

    const { mutate: mutateFamily, loading: updateFamilyLoading, error: updateFamilyError, onError: updateFamilyOnError } = membersService.updateFamily()
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
          return { label: `${family.name || ''}. ${translate.t('member.children')}: ${family.children?.map((child) => child.firstName).toString() || ''}`, value: family.id }
        }) || []
        items.push({ label: translate.t('forms.selectFamilyNew'), value: undefined })
        $q.dialog({
          title: translate.t('forms.selectFamily'),
          message: translate.t('forms.selectFamilyMore'),
          options: {
            type: 'radio',
            model: 'opt1',
            // inline: true
            items: items
          },
          cancel: true,
          persistent: true
        }).onOk(async (data: number) => {
          familyData.id = data
          await updateFamily()
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

    const updateFamily = async () => {
      const variables = cleanObject({ ...familyData })
      // console.log(variables)
      const { data } = await mutateFamily({ family: variables })
      const familyId = familyData.id || data?.insert_families_one?.id
      await mutateMember({ id: id.value, member: { familyId } })
      familyData.id = familyId
      await refetchMemberData()
      $q.notify(translate.t('forms.savedOk'))
    }

    const submitForm = async (): Promise<void> => {
      // console.log('submit clicked')
      return mForm.value?.validate().then(async success => {
        if (success) {
        // yay, models are correct
          // console.log('success')
          await mutateChildren({ children: childrenData.children })
          if (shouldUpdateFamilyName.value) {
            await updateFamily()
          }
          $q.notify(translate.t('forms.savedOk'))
        } else {
        // oh no, user has filled in
        // at least one invalid value
          console.log('no valid')
        }
      })
    }

    // Error handling
    updateFamilyOnError(() => {
      $q.notify({
        type: 'negative',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        message: updateFamilyError.value.message
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
      return loading.value || updateChildrenLoading.value || updateFamilyLoading.value || updateMemberLoading.value
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
      addChild,
      datePattern,
      error,
      submitForm,
      mForm,
      updateFamily,
      isLoading,
      prepareUpdateFamily
    }
  }
}
</script>

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
        <q-btn v-if="!id" :loading="updateFamilyLoading || updateMemberLoading" color="primary" :label="$t('forms.save')" @click="updateFamily"/>
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
          <q-btn :loading="updateChildrenLoading" :disable="children.length === 0" color="primary" :label="$t('forms.save')" type="submit" />
        </q-form>

      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
// import { date } from 'quasar'
import { useRoute } from 'vue-router'
import { MembersService } from 'src/services/members'
import { computed, ref, reactive, toRefs, watch } from 'vue'
import firebase from 'firebase/app'
import 'firebase/auth'
import { Child, ChildrenData } from '@/models/Child'
import type { QForm } from 'quasar'
import { Family } from '@/models/Family'

export default {
  name: 'PagePersonalData',
  setup () {
    const familyData = reactive<Family>({
      id: undefined,
      name: ''
    })

    const childrenData = reactive<ChildrenData>({
      children: []
    })

    const shouldUpdateFamilyName = ref(false)

    const mForm = ref<QForm | null>(null)

    const currentUserId = computed(() => {
      return firebase.auth().currentUser?.uid
    })

    const membersService = new MembersService()
    const route = useRoute()
    const id = computed(() => {
      const params = route.params?.id?.toString()
      if (params) {
        return params
      } else {
        return currentUserId.value || ''
      }
    })

    const cleanObject = (obj: Record<string, unknown>): Record<string, unknown> => {
      for (const propName in obj) {
        if (obj[propName] === '__typename' || obj[propName] === null || obj[propName] === undefined) {
          delete obj[propName]
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return obj
    }

    const { member, loading, error, onResult } = membersService.getById(id.value)

    onResult(() => {
      familyData.id = member.value?.familyId
      familyData.name = member.value?.family?.name
      const childrenTemp = member.value?.family?.children?.map(child => {
        const tempChild: Child = { ...child }
        return tempChild
      })
      childrenData.children = childrenTemp || []
      // console.log(childrenData)
    })

    const datePattern = /^-?[\d]+-[0-1]\d-[0-3]\d$/

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

    // const searchFamily = (name: string) => {

    // }

    const { mutate: mutateFamily, loading: updateFamilyLoading, error: updateFamilyError } = membersService.updateFamily()
    const { mutate: mutateMember, loading: updateMemberLoading, error: updateMemberError } = membersService.updateMember()
    const { mutate: mutateChildren, loading: updateChildrenLoading, error: updateChildrenError } = membersService.updateChildren()

    const updateFamily = async () => {
      const variables = cleanObject({ ...familyData })
      // console.log(variables)
      const { data } = await mutateFamily({ family: variables })
      const familyId = data?.insert_families_one.id
      if (!familyData.id) {
        await mutateMember({ id: id.value, member: { familyId } })
        familyData.id = familyId
      }
    }

    watch(() => familyData.name,
      (newVal, oldVal) => {
        if (oldVal && newVal !== oldVal) {
          shouldUpdateFamilyName.value = true
        }
      })

    const submitForm = async (): Promise<void> => {
      // console.log('submit clicked')
      return mForm.value?.validate().then(async success => {
        if (success) {
        // yay, models are correct
          console.log('success')
          await mutateChildren({ children: childrenData.children })
          if (shouldUpdateFamilyName.value) {
            await updateFamily()
          }
        } else {
        // oh no, user has filled in
        // at least one invalid value
          console.log('no valid')
        }
      })
    }

    return {
      member,
      ...toRefs(childrenData),
      ...toRefs(familyData),
      addChild,
      datePattern,
      loading,
      error,
      submitForm,
      mForm,
      updateFamily,
      updateFamilyLoading,
      updateFamilyError,
      updateMemberLoading,
      updateMemberError,
      updateChildrenLoading,
      updateChildrenError
    }
  }
}
</script>

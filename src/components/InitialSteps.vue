<template>
<div class="q-pa-md">
    <q-stepper
      v-model="step"
      vertical
      color="primary"
      animated
    >
    <div class="q-px-md">
      <h4>{{$t('steps.title')}}</h4>
    </div>
      <q-step
        :name="1"
        :title="$t('steps.personal.title')"
        prefix="1"
        :done="step > 1"
      >
        {{$t('steps.personal.description')}}

        <q-stepper-navigation>
          <q-btn to="/user" :label="$t('steps.personal.title')" color="primary" />
        </q-stepper-navigation>
      </q-step>

      <q-step
        :name="2"
        :title="$t('steps.family.title')"
        prefix="2"
        :done="step > 2"
      >
        {{$t('steps.family.description')}}
        <q-stepper-navigation>
          <q-btn to="/user/family" :label="$t('steps.family.title')" color="primary" />
        </q-stepper-navigation>
      </q-step>

      <q-step
        :name="3"
        :title="$t('steps.iban.title')"
        prefix="3"
        disable
      >
        {{$t('steps.iban.subtitle')}}
        <q-stepper-navigation>
          <q-btn to="/user/payment" :label="$t('steps.iban.title')" color="primary" />
        </q-stepper-navigation>
      </q-step>
    </q-stepper>
</div>
</template>
<script lang="ts">
// import type { Member } from 'src/models/Member'
import { computed } from 'vue'

export default {
  props: {
    member: {
      type: Object,
      default: null
    }
  },
  setup (props) {
    const step = computed(() => {
      // console.log('member:', props.member)
      if (props.member && !props.member.nif) {
        // console.log('step 1')
        return 1
      }

      if (props.member && props.member.nif && !(props.member.family?.children?.length > 0)) {
        // console.log('step 2')
        return 2
      }

      if (props.member && props.member.nif && (props.member.family?.children?.length > 0) && !props.member.family?.manualPayment && !props.member.family?.signatureDate) {
        // console.log('step 3')
        return 3
      }
      // console.log('computed step', props.member)
      return 1
    })

    return {
      step
    }
  }
}
</script>

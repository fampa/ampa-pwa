<template>
  <transition
              appear
              enter-active-class="animated fadeInLeft"
              leave-active-class="animated fadeOutLeft">
    <q-page padding class="q-pa-md bg-grey-2">
      <div v-if="loading">
        <q-skeleton type="text" height="60px" />
        <q-skeleton height="200px" square />
        <q-skeleton type="text" />
        <q-skeleton type="text" />
      </div>
      <div class="article bg-white" v-else-if="!message">
        <h1 class="title">Error 404</h1>
        <p>{{$t('error.404')}}</p>
        <q-btn color="primary" icon="home" to="/" :label="$t('backToHome')" />
      </div>
      <div class="article bg-white" v-else-if="message">
       <q-btn class="float-right" @click="remove" size="sm" color="negative" :label="$t('content.delete')" icon="las la-trash"/>

        <h1 class="title">{{message.title}}</h1>
        <div class="subtitle"><strong>{{formatedDate}}</strong></div>

        <div class="content" v-html="message.content">
        </div>
      </div>
    </q-page>
  </transition>
</template>

<script lang="ts">
import { defineComponent, computed, ref, onMounted } from 'vue'
import { date, useQuasar } from 'quasar'
import { useRoute, onBeforeRouteUpdate, useRouter } from 'vue-router'
import { useStore } from 'src/services/store'
import { useI18n } from 'vue-i18n'
import { ContentsService } from 'src/services/contents'
import { Message } from 'src/models/Message'

export default defineComponent({
  name: 'MessageDetails',
  setup () {
    const contentsService = new ContentsService()
    const route = useRoute()
    const router = useRouter()
    const id = computed(() => Number(route.params.id))
    const store = useStore()
    const member = computed(() => store.state.user.member)
    const $q = useQuasar()
    const i18n = useI18n()

    // Data
    const message = ref<Message>()

    const { result, onResult, loading, onError, error, refetch } = contentsService.getMessageById(id.value)
    const { mutate: setMessageReadMutation } = contentsService.setMessageRead()
    const { mutate: deleteMessageMemberMutation } = contentsService.deleteMessageMember()
    const formatedDate = computed(() => date.formatDate(result.value?.messages_by_pk?.createdAt, 'DD/MM/YYYY, HH:mm'))

    // methods
    onResult(() => {
      message.value = result?.value?.messages_by_pk
    })

    const refetchContent = async () => {
      await refetch()
    }

    const remove = () => {
      $q.dialog({
        title: i18n.t('remove.title'),
        message: i18n.t('remove.question'),
        cancel: true,
        persistent: true
      }).onOk(async () => {
        await deleteMessageMemberMutation({ memberId: member.value.id, messageId: id.value })
      }).onOk(async () => {
        // console.log('>>>> second OK catcher')
        $q.notify(i18n.t('remove.confirm'))
        await router.replace('/')
      }).onCancel(() => {
        // console.log('>>>> Cancel')
      }).onDismiss(() => {
        // console.log('I am triggered on both OK and Cancel')
      })
    }

    onMounted(async () => {
      if (!message.value?.status?.read) {
        await setMessageReadMutation({ memberId: member.value.id, messageId: id.value })
          .then(async () => {
            await store.dispatch('user/setMember', member.value.id)
          })
      }
    })

    onBeforeRouteUpdate(async (to, _) => {
      const id = to.params?.id.toString()
      const newVariables = { id }
      await refetch(newVariables)
    })

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    onError(async () => {
      console.error(error.value.message)
      await router.push('/')
    })

    return {
      message,
      loading,
      formatedDate,
      refetchContent,
      remove
    }
  }
})
</script>
<style scoped lang="scss">
.text-h4 {
  margin-bottom: 0;
}
.subtitle {
  opacity: 0.6;
  margin-top: 0.5rem;
  margin-bottom: 1rem;
}
.updated {
  font-style: italic;
  font-size: 0.9em;
}
.content {
  margin-top: 1rem;
  text-align: justify;
  hyphens: auto;
}
.article {
  max-width: 650px;
  margin: auto auto;
  padding: 2rem;
  border-radius: 15px;
}
</style>

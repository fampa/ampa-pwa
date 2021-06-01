<template>
  <div>
    <q-toggle ref="toggleBtn" :disable="!user || loading || notServiceWorker" :label="label" v-model="toggleState" @update:model-value="toggleManager()" />
    <q-spinner size="30px" v-if="loading" />
  </div>
</template>

<script lang="ts">
import firebase from 'firebase/app'
import 'firebase/messaging'
import 'firebase/database'
import { defineComponent, onMounted, computed, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useStore } from 'src/services/store'
import { MembersService } from 'src/services/members'

export default defineComponent({
  props: [
    'label'
  ],
  emits: ['pushToken', 'childState'],
  setup (props, { emit }) {
    const $q = useQuasar()
    const membersService = new MembersService()
    const store = useStore()
    const user = computed(() => store.state.user?.user)
    const loading = ref(false)
    const toggleState = ref<boolean>($q.localStorage.getItem('toggleState') || false)
    const notServiceWorker = computed(() => {
      if ('serviceWorker' in navigator) {
        return false
      } else {
        return true
      }
    })

    const { mutate: upsertMembersTokenMutation } = membersService.upsertMembersToken()
    const { mutate: deleteMembersTokenMutation } = membersService.deleteMembersToken()

    const refreshSubscribeToken = () => {
      const messaging = firebase.messaging()
      return messaging.onTokenRefresh(function () {
        messaging.getToken()
          .then(async function (refreshedToken) {
            $q.localStorage.set('pushToken', refreshedToken)
            emit('pushToken', refreshedToken)
            // console.log('Token refreshed.', refreshedToken)
            // Indicate that the new Instance ID token has not yet been sent to the
            // app server.
            setTokenSentToServer(false)
            // Send Instance ID token to app server.
            await sendTokenToServer(refreshedToken)
            // ...
          })
          .catch(function (err) {
            console.log('Unable to retrieve refreshed token ', err)
          })
      })
    }

    const pushToggle = () => {
      const pushToken = $q.localStorage.getItem('pushToken')
      console.log('pushToken', pushToken)
      if (pushToken) {
        updateUIForPushEnabled()
      } else {
        updateUIForPushPermissionRequired()
      }
    }
    onMounted(() => {
      pushToggle()
    })
    const toggleManager = () => {
      pushToggle()
      if (!toggleState.value) {
        console.log('In toggleManager, toggleState is false?', toggleState)
        return subscribe()
      } else {
        console.log('In toggleManager, toggleState is true?', toggleState)
        return unsubscribe()
      }
    }
    const subscribe = () => {
      loading.value = true
      console.log('subscription initiated')
      const messaging = firebase.messaging()
      Notification.requestPermission()
        .then(async function (result) {
          console.log('Notification permission granted. Result:', result)
          if (result === 'granted') {
            await navigator.serviceWorker.ready.then(function (registration) {
              // eslint-disable-next-line @typescript-eslint/no-floating-promises
              registration.showNotification('AMPA', {
                body: 'Molt be! Ja pots rebre notificacions push',
                icon: '../statics/icons/icon-192x192.png',
                vibrate: [200, 100, 200, 100, 200, 100, 200],
                tag: 'ampa-tag'
              })
            })
          }
          return messaging.getToken()
            .then(async function (currentToken) {
              if (currentToken) {
                await sendTokenToServer(currentToken)
                $q.localStorage.set('pushToken', currentToken)
                emit('pushToken', currentToken)
                updateUIForPushEnabled()
                loading.value = false
              } else {
                // Show permission request.
                console.log('No Instance ID token available. Request permission to generate one.')
                // Show permission UI.
                updateUIForPushPermissionRequired()
                setTokenSentToServer(false)
                loading.value = false
              }
            })
            .catch(function (err) {
              console.log('An error occurred while retrieving token. ', err)
              setTokenSentToServer(false)
              loading.value = false
            })
        })
        .catch(function (err) {
          console.log('Unable to get permission to notify.', err)
        })
    }
    const unsubscribe = async () => {
      const messaging = firebase.messaging()
      const pushToken = $q.localStorage.getItem('pushToken')
      await deleteTokenFromServer(pushToken)
      await messaging.deleteToken()
        .then(function () {
          $q.localStorage.remove('pushToken')
          emit('pushToken')
          // console.log('token deleted', pushToken)
          updateUIForPushPermissionRequired()
        })
    }
    const sendTokenToServer = async (currentToken) => {
      // const pushDBKey = this.$firebaseRefs.tokenDB.push().key
      // this.$q.localStorage.set('pushDBKey', pushDBKey)
      const variables = {
        memberId: user.value.uid,
        token: currentToken
      }
      await upsertMembersTokenMutation(variables)
      console.log('Token sent to server:', currentToken)
    }
    const deleteTokenFromServer = async (pushToken) => {
      const variables = {
        memberId: user.value.uid,
        token: pushToken
      }
      await deleteMembersTokenMutation(variables)
        .then(() => {
          emit('pushToken')
          $q.localStorage.remove('pushToken')
          console.log('Token deleted from server')
        })
    }
    const updateUIForPushEnabled = (/* currentToken */) => {
      emit('childState', true)
      toggleState.value = true
    }
    const updateUIForPushPermissionRequired = () => {
      emit('childState', false)
      toggleState.value = false
    }
    const setTokenSentToServer = (state) => {
      console.log('setTokenSentToServer', state)
    }

    return {
      loading,
      toggleState,
      toggleManager,
      subscribe,
      unsubscribe,
      sendTokenToServer,
      deleteTokenFromServer,
      updateUIForPushEnabled,
      updateUIForPushPermissionRequired,
      setTokenSentToServer,
      notServiceWorker,
      refreshSubscribeToken,
      user
    }
  }
})
</script>

<style>
</style>

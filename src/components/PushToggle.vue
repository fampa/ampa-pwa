<template>
  <div>
    <q-toggle ref="toggleBtn" :disabled="loading || notServiceWorker" :label="label" v-model="toggleState" @input="toggleManager()" />
    <q-spinner size="30px" v-if="loading" />
  </div>
</template>

<script>
import * as firebase from 'firebase/app'
import 'firebase/messaging'
import 'firebase/database'
import { defineComponent, onMounted, computed, ref } from 'vue'
import { useQuasar } from 'quasar'

export default defineComponent({
  props: [
    'label'
  ],
  emits: ['pushToken', 'childState'],
  setup (props, { emit }) {
    const $q = useQuasar()
    const loading = ref(false)
    const toggleState = ref<boolean>($q.localStorage.getItem('toggleState') || false)

    const notServiceWorker = computed(() => {
      if ('serviceWorker' in navigator) {
        return false
      } else {
        return true
      }
    })

    const refreshSubscribeToken = () => {
      const messaging = firebase.messaging()
      return messaging.onTokenRefresh(function () {
        messaging.getToken()
          .then(function (refreshedToken) {
            $q.localStorage.set('pushToken', refreshedToken)
            emit('pushToken', refreshedToken)
            // console.log('Token refreshed.', refreshedToken)
            // Indicate that the new Instance ID token has not yet been sent to the
            // app server.
            setTokenSentToServer(false)
            // Send Instance ID token to app server.
            sendTokenToServer(refreshedToken)
            // ...
          })
          .catch(function (err) {
            console.log('Unable to retrieve refreshed token ', err)
            showToken('Unable to retrieve refreshed token ', err)
          })
      })
    }

    const pushToggle = () => {
      const pushToken = $q.localStorage.getItem('pushToken')
      console.log('pushToken', pushToken)
      if (pushToken) {
        this.updateUIForPushEnabled(pushToken)
      } else {
        this.updateUIForPushPermissionRequired()
      }
    }
    onMounted(() => {
      pushToggle()
    })
    const toggleManager = () => {
      pushToggle()
      if (!toggleState.value) {
        // console.log('In toggleManager, toggleState is false?', this.toggleState)
        return subscribe()
      } else {
        // console.log('In toggleManager, toggleState is true?', this.toggleState)
        return unsubscribe()
      }
    }
    const subscribe = () => {
      loading.value = true
      const messaging = firebase.messaging()
      messaging.requestPermission()
        .then(async function (result) {
          console.log('Notification permission granted. Result:', result)
          if (result === 'granted') {
            await navigator.serviceWorker.ready.then(function (registration) {
              // eslint-disable-next-line @typescript-eslint/no-floating-promises
              registration.showNotification('#coixinet', {
                body: 'Molt be! Ja pots rebre notificacions push',
                icon: '../statics/icons/icon-192x192.png',
                vibrate: [200, 100, 200, 100, 200, 100, 200],
                tag: 'coixinet-tag'
              })
            })
          }
          return messaging.getToken()
            .then(function (currentToken) {
              if (currentToken) {
                sendTokenToServer(currentToken)
                $q.localStorage.set('pushToken', currentToken)
                emit('pushToken', currentToken)
                updateUIForPushEnabled(currentToken)
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
              showToken('Error retrieving Instance ID token. ', err)
              setTokenSentToServer(false)
              loading.value = false
            })
        })
        .catch(function (err) {
          console.log('Unable to get permission to notify.', err)
        })
    }
    const unsubscribe = () => {
      const messaging = firebase.messaging()
      const pushToken = this.$q.localStorage.getItem('pushToken')
      this.deleteTokenFromServer(pushToken)
      messaging.deleteToken(pushToken)
        .then(function () {
          $q.localStorage.remove('pushToken')
          emit('pushToken')
          // console.log('token deleted', pushToken)
          updateUIForPushPermissionRequired()
        })
    }
    const sendTokenToServer = (currentToken) => {
      // const pushDBKey = this.$firebaseRefs.tokenDB.push().key
      // this.$q.localStorage.set('pushDBKey', pushDBKey)
      this.$firebaseRefs.tokenDB.child(currentToken).set(true)
      // console.log('Token sent to server:', currentToken)
    }
    const deleteTokenFromServer = () => {
      const pushToken = this.$q.localStorage.getItem('pushToken')
      this.$firebaseRefs.tokenDB.child(pushToken).remove()
      this.$emit('pushToken')
      this.$q.localStorage.remove('pushToken')
      // console.log('Token deleted from server')
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
    const showToken = (msg) => {
      console.log(msg)
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
      showToken,
      notServiceWorker,
      refreshSubscribeToken
    }
  }
})
</script>

<style>
</style>

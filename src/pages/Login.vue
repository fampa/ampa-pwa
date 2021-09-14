<template>
  <q-page class="flex flex-center bg-grey-2">
    <div class="text-center">
      <img alt="AMPA" src="icons/icon-128x128.png">
      <div id="firebaseui-auth-container"></div>
    </div>
  </q-page>
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import 'firebaseui/dist/firebaseui.css'
import { useRoute, useRouter } from 'vue-router'
// import { useQuasar } from 'quasar'
import firebase from 'firebase/app'
import { onMounted } from 'vue'
import { useStore } from 'src/services/store'
import * as FirebaseUi from 'firebaseui'
import { useI18n } from 'vue-i18n'

export default {
  name: 'PageLogin',
  setup () {
    // const $q = useQuasar()
    // $q.loading.show()
    const initUi = async () => {
      const route = useRoute()
      const router = useRouter()
      // FirebaseUI config.
      const store = useStore()
      const locale = store.state.settings.language
      const i18n = useI18n()

      let firebaseUILoader

      if (locale === 'es') {
        firebaseUILoader = import('src/lib/firebaseui-npm__es')
      } else {
        firebaseUILoader = import('src/lib/firebaseui-npm__ca')
      }

      await firebaseUILoader.then(() => {
        const uiConfig = {
          signInSuccessUrl: route.query && route.query.next ? route.query.next.toString() : '/',
          callbacks: {
            uiShown: function () {
            // return $q.loading.hide()
            },
            signInSuccessWithAuthResult: function () {
              console.log('sign in success')
              const successResponse = async () => await router.replace(route.query && route.query.next ? route.query.next.toString() : '/')
              console.log(successResponse)
              return true
            }

          },
          signInOptions: [
            {
              provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
              fullLabel: i18n.t('firebaseui.google')
            },
            {
              provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
              fullLabel: i18n.t('firebaseui.email')
            }
            // {
            //   provider: firebase.auth.PhoneAuthProvider.PROVIDER_ID,
            //   fullLabel: i18n.t('firebaseui.phone'),
            //   defaultCountry: 'ES'
            // }
            // firebase.auth.FacebookAuthProvider.PROVIDER_ID,
            // firebase.auth.TwitterAuthProvider.PROVIDER_ID,
            // firebase.auth.GithubAuthProvider.PROVIDER_ID,
          // firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
          ],
          credentialHelper: FirebaseUi.auth.CredentialHelper.GOOGLE_YOLO,
          // signInFlow: 'popup',
          // tosUrl and privacyPolicyUrl accept either url string or a callback
          // function.
          // Terms of service url/callback.
          tosUrl: '/terms',
          privacyPolicyUrl: '/privacy'
        // Privacy policy url/callback.
        // privacyPolicyUrl: function () {
        //   window.location.assign('<your-privacy-policy-url>');
        // }
        }

        // Initialize the FirebaseUI Widget using firebase.
        let ui = FirebaseUi.auth.AuthUI.getInstance()
        if (!ui) {
          ui = new FirebaseUi.auth.AuthUI(firebase.auth())
        // The start method will wait until the DOM is loaded.
        }

        // avoids duplicated ui on cached page
        const firebaseUi = document.getElementsByClassName('firebaseui-container')
        if (firebaseUi[0]) {
          firebaseUi[0].remove()
        }

        ui.start('#firebaseui-auth-container', uiConfig)

        if (ui.isPendingRedirect()) {
          console.log('pending redirect')
        // $q.loading.show()
        }
        firebase.auth().onAuthStateChanged(function (user) {
          if ((user) && !user.emailVerified) {
          // var actionCodeSettings = {
          //   url: 'http://..../',
          //   handleCodeInApp: true
          // }
            user.sendEmailVerification().then(function () {
            // Email sent.
            }).catch(function (error) {
              console.error(error)
            })
          }
        })
      })
    }

    onMounted(async () => {
      await initUi()
    })
  }
}
</script>

<style lang="scss">
.firebaseui-idp-button, .firebaseui-tenant-button {
  max-width: 260px;
}
</style>

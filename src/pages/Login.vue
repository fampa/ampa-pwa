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
import { useRoute } from 'vue-router'
// import { useQuasar } from 'quasar'
import firebase from 'firebase/app'
import { onMounted } from 'vue'
import { useStore } from 'src/services/store'
import { i18n } from 'src/boot/i18n'

export default {
  name: 'PageLogin',
  setup () {
    // const $q = useQuasar()
    // $q.loading.show()
    const initUi = () => {
      const route = useRoute()
      // FirebaseUI config.
      const store = useStore()
      const locale = store.state.settings.language
      const translate = i18n.global

      let firebaseUILoader

      if (locale === 'es') {
        firebaseUILoader = import('src/lib/firebaseui-npm__es')
      } else {
        firebaseUILoader = import('src/lib/firebaseui-npm__ca')
      }

      firebaseUILoader.then((firebaseui) => {
        const uiConfig = {
          signInSuccessUrl: route.query.redirect?.toString() || '/',
          callbacks: {
            uiShown: function () {
            // return $q.loading.hide()
            },
            signInSuccessWithAuthResult: function () {
              console.log('sign in success')
              return true
            }

          },
          signInOptions: [
            {
              provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
              fullLabel: translate.t('firebaseui.google')
            },
            {
              provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
              fullLabel: translate.t('firebaseui.email')
            },
            {
              provider: firebase.auth.PhoneAuthProvider.PROVIDER_ID,
              fullLabel: translate.t('firebaseui.phone')
            }
            // firebase.auth.FacebookAuthProvider.PROVIDER_ID,
            // firebase.auth.TwitterAuthProvider.PROVIDER_ID,
            // firebase.auth.GithubAuthProvider.PROVIDER_ID,
          // firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
          ],
          credentialHelper: firebaseui.auth.CredentialHelper.GOOGLE_YOLO,
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
        let ui = firebaseui.auth.AuthUI.getInstance()
        if (!ui) {
          ui = new firebaseui.auth.AuthUI(firebase.auth())
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

    onMounted(() => {
      initUi()
    })
  }
}
</script>

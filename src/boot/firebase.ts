import { boot } from 'quasar/wrappers'
import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/database'
import 'firebase/storage'
import { ref } from 'vue'
import type { BootFileParams } from '@quasar/app'

const config = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
}

// bootFileParams is { app, router, ...}
export default boot((context: BootFileParams<unknown>) => {
  firebase.initializeApp(config)
  // monitor user
  firebase.auth().onAuthStateChanged(async function (user) {
    if (user) {
      const uid = ref<string>('')
      const displayName = ref<string|null>('')
      const email = ref<string|null>('')
      const emailVerified = ref<boolean>(false)
      const photoURL = ref<string|null>('')

      const token = await user.getIdToken(true)
      const tokenResult = await user.getIdTokenResult(true)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const hasuraClaim = tokenResult.claims ? tokenResult.claims['https://hasura.io/jwt/claims'] : null
      const isadmin = hasuraClaim ? hasuraClaim['x-hasura-default-role'] === 'admin' : false
      uid.value = user.uid
      displayName.value = user.displayName
      email.value = user.email
      emailVerified.value = user.emailVerified
      photoURL.value = user.photoURL

      await context.store.dispatch('user/setUser', { uid, displayName, email, emailVerified, photoURL, token, isadmin })
    }
  })
})

export { firebase }

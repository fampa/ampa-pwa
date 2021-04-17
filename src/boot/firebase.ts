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
  const firebaseUser = ref<firebase.User | null>(null)
  const isAdmin = ref<boolean>(false)
  firebase.auth().onAuthStateChanged(async function (user) {
    if (user) {
      const tokenResult = await user.getIdTokenResult(true)
      // console.log('tokenResult', tokenResult)
      const hasuraClaim = tokenResult?.claims ? tokenResult.claims['https://hasura.io/jwt/claims'] as Record<string, unknown> : null
      const firebaseUserIsAdmin = hasuraClaim ? hasuraClaim['x-hasura-default-role'] === 'admin' : false
      isAdmin.value = firebaseUserIsAdmin
      firebaseUser.value = user
    } else {
      isAdmin.value = false
      firebaseUser.value = null
    }
    context.store.commit('user/setAdmin', isAdmin.value)
    context.store.commit('user/setUser', firebaseUser.value)
  })
})

export { firebase }

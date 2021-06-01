/* eslint-disable no-undef */
// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/8.5.0/firebase-app.js')
importScripts('https://www.gstatic.com/firebasejs/8.5.0/firebase-messaging.js')

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
// const firebaseConfig = {
//   apiKey: process.env.FIREBASE_API_KEY,
//   authDomain: process.env.FIREBASE_AUTH_DOMAIN,
//   databaseURL: process.env.FIREBASE_DATABASE_URL,
//   projectId: process.env.FIREBASE_PROJECT_ID,
//   storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.FIREBASE_APP_ID,
//   measurementId: process.env.FIREBASE_MEASUREMENT_ID
// }
const firebaseConfig = {
  apiKey: 'AIzaSyD8Tmz14a2qE1nh2pGRHAFTHF0iZhFr2F0',
  authDomain: 'fampa-pwa.firebaseapp.com',
  databaseURL: 'https://fampa-pwa-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'fampa-pwa',
  storageBucket: 'fampa-pwa.appspot.com',
  messagingSenderId: '994389005552',
  appId: '1:994389005552:web:f5944ac5bd3351fa0a1e35',
  measurementId: 'G-Z1JCQX9S3X'
}
firebase.initializeApp(firebaseConfig)

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging()

// Handle incoming messages. Called when:
// - a message is received while the app has focus
// - the user clicks on an app notification created by a service worker
//   `messaging.onBackgroundMessage` handler.

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload)
  // Customize notification here
  const notificationTitle = 'Background Message Title'
  const notificationOptions = {
    body: 'Background Message body.',
    icon: '/firebase-logo.png'
  }

  self.registration.showNotification(notificationTitle,
    notificationOptions)
})

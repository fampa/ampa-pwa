/* eslint-disable @typescript-eslint/no-unsafe-return */
import { register } from 'register-service-worker'
import { Notify } from 'quasar'
import { i18n } from 'src/boot/i18n'

const translate = i18n.global
// The ready(), registered(), cached(), updatefound() and updated()
// events passes a ServiceWorkerRegistration instance in their arguments.
// ServiceWorkerRegistration: https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration
// posava process.env.service_WORKER_FILE pero no es substituía pel valor durant el build així que està hardcoded
register('service-worker.js', {
  // The registrationOptions object will be passed as the second argument
  // to ServiceWorkerContainer.register()
  // https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/register#Parameter

  // registrationOptions: { scope: './' },

  ready (/* registration */) {
    // console.log('Service worker is active.')
  },

  registered (/* registration */) {
    // console.log('Service worker has been registered.')
  },

  cached (/* registration */) {
    // console.log('Content has been cached for offline use.')
  },

  updatefound (/* registration */) {
    // console.log('New content is downloading.')
  },

  updated (registration) { // registration -> a ServiceWorkerRegistration instance
    // console.log('New content is available; please refresh.')
    Notify.create({
      timeout: 0,
      message: translate.t('newVersion'),
      actions: [
        {
          icon: 'las la-sync',
          label: translate.t('update'),
          color: 'white',
          handler: () => {
            registration?.waiting?.postMessage('skipWaiting')
            window.location.reload()
          }
        }]
    })
  },

  offline () {
    // console.log('No internet connection found. App is running in offline mode.')
  },

  error (/* err */) {
    // console.error('Error during service worker registration:', err)
  }
})

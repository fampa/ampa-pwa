/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/*
 * This file (which will be your service worker)
 * is picked up by the build system ONLY if
 * quasar.conf > pwa > workboxPluginMode is set to "InjectManifest"
 */

import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching'
import { registerRoute, NavigationRoute } from 'workbox-routing'
import { StaleWhileRevalidate } from 'workbox-strategies'
import { pageCache } from 'workbox-recipes'

// Use with precache injection
precacheAndRoute(self.__WB_MANIFEST)

// Cache routes on a SPA
const handler = createHandlerBoundToURL('/index.html')
const navigationRoute = new NavigationRoute(handler)
registerRoute(navigationRoute)

self.addEventListener('message', e => {
  if (e.data === 'skipWaiting') {
    // console.log('skipWaiting called')
    self.skipWaiting()
  }
})

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim())
})

pageCache()

registerRoute(
  /^https:\/\/firebasestorage\.googleapis\.com\/.*/,
  new StaleWhileRevalidate()
)

registerRoute(
  /^https:\/\/images\.unsplash\.com\/.*/,
  new StaleWhileRevalidate()
)

self.addEventListener('push', (event) => {
  const title = 'AMPA'
  const options = {
    body: event.data.text(),
    renotify: true,
    icon: event.data.notification.icon || '/statics/icons/icon-512x512.png',
    badge: event.data.notification.badge || '/statics/icons/icon-128x128.png',
    image: event.data.notification.image || '',
    timestamp: event.data.notification.timestamp || Date.parse(new Date()),
    vibrate: event.data.notification.vibrate || [200, 100, 200, 100, 200, 100, 200],
    tag: event.data.notification.tag || 'ampa-tag',
    click_action: event.data.notification.click_action
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', function (event) {
  const url = event.click_action
  event.notification.close() // Android needs explicit close.
  event.waitUntil(
    // eslint-disable-next-line no-undef
    clients.matchAll({ type: 'window' }).then(windowClients => {
      // Check if there is already a window/tab open with the target URL
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i]
        // If so, just focus it.
        if (client.url === url && 'focus' in client) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return client.focus()
        }
      }
      // If not, then open the target URL in a new window/tab.
      // eslint-disable-next-line no-undef
      if (clients.openWindow) {
        // eslint-disable-next-line no-undef
        clients.openWindow(url)
      }
    })
  )
})

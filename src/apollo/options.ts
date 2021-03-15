import { createHttpLink, InMemoryCache, NormalizedCacheObject } from '@apollo/client/core'
import type { ApolloClientOptions } from '@apollo/client/core/ApolloClient'
import type { BootFileParams } from '@quasar/app'
import { CachePersistor } from 'apollo-cache-persist'
import { PersistentStorage, PersistedData } from 'apollo-cache-persist/types'

// bootFileParams is { app, router, ...}
// eslint-disable-next-line @typescript-eslint/require-await
export async function getClientOptions (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  bootFileParams?: BootFileParams<unknown>
): Promise<ApolloClientOptions<unknown>> {
  const SCHEMA_VERSION = '1'
  const SCHEMA_VERSION_KEY = 'apollo-schema-version'
  const cache = new InMemoryCache({})

  const persistor = new CachePersistor({
    cache,
    storage: window.localStorage as PersistentStorage<PersistedData<NormalizedCacheObject>>
  })

  const currentVersion = window.localStorage.getItem(SCHEMA_VERSION_KEY)
  if (currentVersion === SCHEMA_VERSION) {
    await persistor.restore()
  } else {
    await persistor.purge()
    window.localStorage.setItem(SCHEMA_VERSION_KEY, SCHEMA_VERSION)
  }
  return Object.assign(
    // General options.
    {
      link: createHttpLink({
        uri: process.env.GRAPHQL_URI || 'http://api.example.com'
      }),

      cache: cache
    },

    // Specific Quasar mode options.
    process.env.MODE === 'spa' ? {
      //
    } : {},
    process.env.MODE === 'ssr' ? {
      //
    } : {},
    process.env.MODE === 'pwa' ? {
      //
    } : {},
    process.env.MODE === 'bex' ? {
      //
    } : {},
    process.env.MODE === 'cordova' ? {
      //
    } : {},
    process.env.MODE === 'capacitor' ? {
      //
    } : {},
    process.env.MODE === 'electron' ? {
      //
    } : {},

    // dev/prod options.
    process.env.DEV ? {
      //
    } : {},
    process.env.PROD ? {
      //
    } : {},

    // For ssr mode, when on server.
    process.env.MODE === 'ssr' && process.env.SERVER ? {
      ssrMode: true
    } : {},
    // For ssr mode, when on client.
    process.env.MODE === 'ssr' && process.env.CLIENT ? {
      ssrForceFetchDelay: 100
    } : {}
  ) as ApolloClientOptions<unknown>
}

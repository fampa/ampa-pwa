import { createHttpLink, InMemoryCache } from '@apollo/client/core'
import type { ApolloClientOptions } from '@apollo/client/core/ApolloClient'
import type { BootFileParams } from '@quasar/app'

// bootFileParams is { app, router, ...}
// eslint-disable-next-line @typescript-eslint/require-await
export async function getClientOptions (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  bootFileParams?: BootFileParams<unknown>
): Promise<ApolloClientOptions<unknown>> {
  return Object.assign(
    // General options.
    {
      link: createHttpLink({
        uri: process.env.GRAPHQL_URI || 'http://api.example.com'
      }),

      cache: new InMemoryCache({})
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

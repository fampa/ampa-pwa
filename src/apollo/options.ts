/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
// import { Article } from '@/models/Article'
import { createHttpLink, InMemoryCache } from '@apollo/client/core'
import type { ApolloClientOptions } from '@apollo/client/core/ApolloClient'
import type { BootFileParams } from '@quasar/app'
import { persistCache, SessionStorageWrapper } from 'apollo3-cache-persist'
import { offsetLimitPagination } from '@apollo/client/utilities'

// bootFileParams is { app, router, ...}
// eslint-disable-next-line @typescript-eslint/require-await
export async function getClientOptions (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  bootFileParams?: BootFileParams<unknown>
): Promise<ApolloClientOptions<unknown>> {
  const cache = new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          articles: offsetLimitPagination()
        }
      }
    }
  })

  await persistCache({
    cache,
    storage: new SessionStorageWrapper(window.sessionStorage)
  })

  return Object.assign(
    // General options.
    {
      link: createHttpLink({
        uri: process.env.GRAPHQL_URI || 'http://api.example.com'
      }),

      cache: cache,
      defaultOptions: {
        watchQuery: {
          fetchPolicy: 'cache-and-network',
          nextFetchPolicy: 'cache-first'
        },
        query: {
          fetchPolicy: 'cache-and-network',
          nextFetchPolicy: 'cache-first'
        }
      }
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

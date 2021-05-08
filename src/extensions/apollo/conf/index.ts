import type { ApolloClientOptions } from '@apollo/client'
// import { createHttpLink, InMemoryCache } from '@apollo/client'
import {
  createHttpLink,
  InMemoryCache,
  from,
  ApolloLink,
  Observable
} from '@apollo/client/core'
/* import type { BootFileParams } from '@quasar/app' */
import { offsetLimitPagination } from '@apollo/client/utilities'
import { persistCache, LocalStorageWrapper } from 'apollo3-cache-persist'
import firebase from 'firebase/app'
import 'firebase/auth'

export async function getClientOptions(/* {app, router, ...}: Partial<BootFileParams<unknown>> */): Promise<ApolloClientOptions<unknown>> {
  const cache = new InMemoryCache({
    addTypename: false,
    typePolicies: {
      Query: {
        fields: {
          articles: {
            ...offsetLimitPagination()
          }
        }
      }
    }
  })

  await persistCache({
    cache,
    storage: new LocalStorageWrapper(window.localStorage)
  })

  const authMiddleware = new ApolloLink(
    (operation, forward) =>
      new Observable(observer => {
        firebase.auth().onAuthStateChanged(function (user) {
          const customHeaders = operation.getContext().hasOwnProperty("headers") ? operation.getContext().headers : {};
          if (user) {
            user.getIdToken(true)
              .then(token => {
                operation.setContext({
                  headers: {
                    ...customHeaders,
                    authorization: token ? `Bearer ${token}` : ''
                  }
                })
              })
              .then(() => {
                const subscriber = {
                  next: observer.next.bind(observer),
                  error: observer.error.bind(observer),
                  complete: observer.complete.bind(observer)
                }
                forward(operation).subscribe(subscriber)
              })
              .catch(err => {
                observer.error(err)
              })
          } else {
            const subscriber = {
              next: observer.next.bind(observer),
              error: observer.error.bind(observer),
              complete: observer.complete.bind(observer)
            }
            forward(operation).subscribe(subscriber)
          }
        })
      })
  )

  const httpLink = createHttpLink({
    uri: process.env.GRAPHQL_URI || 'http://api.example.com'
  })

  return <ApolloClientOptions<unknown>>Object.assign(
    // General options.
    {
      link: from([
        authMiddleware,
        httpLink
      ]),
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
    process.env.MODE === 'spa'
      ? {
          //
        }
      : {},
    process.env.MODE === 'ssr'
      ? {
          //
        }
      : {},
    process.env.MODE === 'pwa'
      ? {
          //
        }
      : {},
    process.env.MODE === 'bex'
      ? {
          //
        }
      : {},
    process.env.MODE === 'cordova'
      ? {
          //
        }
      : {},
    process.env.MODE === 'capacitor'
      ? {
          //
        }
      : {},
    process.env.MODE === 'electron'
      ? {
          //
        }
      : {},

    // dev/prod options.
    process.env.DEV
      ? {
          //
        }
      : {},
    process.env.PROD
      ? {
          //
        }
      : {},

    // For ssr mode, when on server.
    process.env.MODE === 'ssr' && process.env.SERVER
      ? {
          ssrMode: true,
        }
      : {},
    // For ssr mode, when on client.
    process.env.MODE === 'ssr' && process.env.CLIENT
      ? {
          ssrForceFetchDelay: 100,
        }
      : {}
  ) as ApolloClientOptions<unknown>
}

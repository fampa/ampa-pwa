import type { ApolloClientOptions } from '@apollo/client'
// import { createHttpLink, InMemoryCache } from '@apollo/client'
import {
  createHttpLink,
  InMemoryCache,
  ApolloLink,
  Observable,
  from,
  split,
  concat
} from '@apollo/client/core'
/* import type { BootFileParams } from '@quasar/app' */
import { offsetLimitPagination, getMainDefinition } from '@apollo/client/utilities'
import { persistCache, LocalStorageWrapper } from 'apollo3-cache-persist'
// import { WebSocketLink } from '@apollo/client/link/ws'
import firebase from 'firebase/app'
import 'firebase/auth'

export async function getClientOptions(/* {app, router, ...}: Partial<BootFileParams<unknown>> */): Promise<ApolloClientOptions<unknown>> {
  const cache = new InMemoryCache({
    addTypename: false,
    typePolicies: {
      Query: {
        fields: {
          content: {
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
                    Authorization: token ? `Bearer ${token}` : ''
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

// const wsLink = new WebSocketLink({
//   uri: process.env.GRAPHQL_WS_URI || 'http://api.example.com',
//   options: {
//     reconnect: true,
//     connectionParams: async () => {
//       const token = await firebase.auth().currentUser.getIdToken()
//       return {
//         headers: {
//           Authorization: token ? `Bearer ${token}` : ''
//         }
//       }
//     }
//   }
// })

// const splitLink = split(
//   ({ query }) => {
//     const definition = getMainDefinition(query);
//     return (
//       definition.kind === 'OperationDefinition' &&
//       definition.operation === 'subscription'
//     );
//   },
//   // wsLink,
//   concat(authMiddleware, httpLink)
// )


  return <ApolloClientOptions<unknown>>Object.assign(
    // General options.
    {
      link: from([
        authMiddleware,
        httpLink
      ]),
      cache: cache,
      connectToDevTools: true,
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

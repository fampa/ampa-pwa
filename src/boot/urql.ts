import { boot } from 'quasar/wrappers'
import urql, { createClient, makeOperation, dedupExchange, fetchExchange } from '@urql/vue'
import type { Client } from '@urql/vue'
import { authExchange } from '@urql/exchange-auth'
import { until } from '@vueuse/core'
import { isFirebaseInit } from './firebase'
import 'firebase/auth'
import { useAuth } from '@vueuse/firebase'
import { offlineExchange } from '@urql/exchange-graphcache'
import { makeDefaultStorage } from '@urql/exchange-graphcache/default-storage'
// import type { BootFileParams } from '@quasar/app'
// bootFileParams is { app, router, ...}

let client: Client

const storage = makeDefaultStorage({
  idbName: 'graphcache-v3', // The name of the IndexedDB database
  maxAge: 7 // The maximum age of the persisted data in days
})

const introspectedSchema = {
  __schema: {
    queryType: { name: 'Query' },
    mutationType: { name: 'Mutation' },
    subscriptionType: { name: 'Subscription' }
  }
}

const cache = offlineExchange({
  schema: introspectedSchema,
  storage,
  updates: {
    /* ... */
  },
  optimistic: {
    /* ... */
  }
})

function addAuthExchange () {
  return authExchange({
    async getAuth () {
      await until(isFirebaseInit).toBeTruthy({ timeout: 500 })

      if (!isFirebaseInit.value) { return null }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { isAuthenticated, user } = useAuth()

      if (!isAuthenticated.value) { return null }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return await user.value?.getIdToken(true)
    },
    addAuthToOperation ({ operation, authState }) {
      if (!authState) { return operation }

      const fetchOptions = typeof operation.context.fetchOptions === 'function' ? operation.context.fetchOptions() : operation.context.fetchOptions || {}

      return makeOperation(operation.kind, operation, {
        ...operation.context,
        fetchOptions: {
          ...fetchOptions,
          headers: {
            ...fetchOptions.headers,
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            Authorization: `Bearer ${authState}`
          }
        }
      })
    }
  })
}

export default boot(({ app }) => {
  client = createClient({
    url: process.env.GRAPHQL_URI || '',
    exchanges: [
      dedupExchange,
      cache,
      addAuthExchange(),
      fetchExchange
    ],
    requestPolicy: 'cache-and-network'
  })
  app.use(urql, client)
})

export { client }

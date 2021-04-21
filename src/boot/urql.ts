import { boot } from 'quasar/wrappers'
import { createClient, dedupExchange, cacheExchange, fetchExchange } from '@urql/vue'
import type { Client } from '@urql/vue'
// import { authExchange } from '@urql/exchange-auth'
// import { ApolloClient } from '@apollo/client/core'
// import { getClientOptions } from 'src/extensions/apollo/conf'
// import type { BootFileParams } from '@quasar/app'

// let apolloClient: ApolloClient<unknown>

// bootFileParams is { app, router, ...}
let client: Client

export default boot((/* bootFileParams: BootFileParams<unknown> */) => {
  client = createClient({
    url: process.env.GRAPHQL_URI || '',
    exchanges: [
      dedupExchange,
      cacheExchange,
      // authExchange({
      /* config */
      // }),
      fetchExchange
    ]
  })
})

export { client }

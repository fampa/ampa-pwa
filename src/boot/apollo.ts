import { boot } from 'quasar/wrappers'
import { ApolloClient } from '@apollo/client/core'
import { getClientOptions } from 'src/extensions/apollo/conf'
// import type { BootFileParams } from '@quasar/app'

let apolloClient: ApolloClient<unknown>

// bootFileParams is { app, router, ...}
export default boot(async (/* bootFileParams: BootFileParams<unknown> */) => {
  const options = await getClientOptions()

  apolloClient = new ApolloClient(options)
})

export { apolloClient }

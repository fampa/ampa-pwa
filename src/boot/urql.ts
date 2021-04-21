import { boot } from 'quasar/wrappers'
import { createClient } from '@urql/vue'
import firebase from 'firebase/app'
import 'firebase/auth'
import type { Client } from '@urql/vue'
// import { ApolloClient } from '@apollo/client/core'
// import { getClientOptions } from 'src/extensions/apollo/conf'
// import type { BootFileParams } from '@quasar/app'

// let apolloClient: ApolloClient<unknown>

// bootFileParams is { app, router, ...}
let client: Client

export default boot((/* bootFileParams: BootFileParams<unknown> */) => {
  // const options = await getClientOptions()
  // apolloClient = new ApolloClient(options)
  firebase.auth().onAuthStateChanged(async function (user) {
    let token = ''
    if (user) token = await user.getIdToken(true)
    client = createClient({
      url: process.env.GRAPHQL_URI || '',
      fetchOptions: () => {
        return {
          headers: { authorization: token ? `Bearer ${token}` : '' }
        }
      }
    })
  })
})

export { client }

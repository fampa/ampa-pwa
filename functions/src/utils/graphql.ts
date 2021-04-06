import { GraphQLClient } from 'graphql-request'
import * as functions from 'firebase-functions'
import 'firebase-functions'
// import * as fetch from 'node-fetch'

// global.Headers = fetch.Headers

export default async function graphqlClient (query: any, variables: any) {
  const endpoint = functions.config().env.graphql.url as string
  const headers = new Headers()

  headers.append('x-hasura-admin-secret', functions.config().env.graphql.adminSecret as string)

  const graphQLClient = new GraphQLClient(endpoint, {
    headers: headers
  })

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const data = await graphQLClient.request(query, variables)
  console.log('data from server', data)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return data
}

import { GraphQLClient } from 'graphql-request'
// import * as fetch from 'node-fetch'

// global.Headers = fetch.Headers

export default async function graphqlClient (query: any, variables: any) {
  const endpoint = process.env.GRAPHQL_URI || 'https://db.monjo.xyz'
  const headers = new Headers()

  if (process.env.HASURA_ADMIN_SECRET) {
    headers.append('x-hasura-admin-secret', process.env.HASURA_ADMIN_SECRET)
  }

  const graphQLClient = new GraphQLClient(endpoint, {
    headers: headers
  })

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const data = await graphQLClient.request(query, variables)
  console.log('data from server', data)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return data
}

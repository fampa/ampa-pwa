import { GraphQLClient } from 'graphql-request'
import * as functions from 'firebase-functions'
import 'firebase-functions'
import * as fetch from 'node-fetch'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
/* @ts-expect-error */
global.Headers = fetch.Headers

const endpoint = functions.config().env.graphql.url as string
const headers = new Headers()

headers.append('x-hasura-admin-secret', functions.config().env.graphql.adminSecret as string)

export const client = new GraphQLClient(endpoint, {
  headers: headers
})

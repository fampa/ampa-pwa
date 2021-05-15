import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'
import { gql } from 'graphql-request'
import { client } from './graphql'

const changeAdminInDatabase = async (id: string, isAdmin: boolean) => {
  const mutation = gql`mutation updateMemberAdmin($id: String!, $isAdmin: Boolean!) {
    update_members_by_pk(pk_columns: {id: $id}, _set: {isAdmin: $isAdmin}) {
      isAdmin
    }
  }
  `
  const variables = {
    id,
    isAdmin
  }
  try {
    const data = await client.request(mutation, variables)
    return data
  } catch (error) {
    functions.logger.error(error)
    return error
  }
}

export const updateClaims = async (uid: string, isAdmin = false) => {
  const defaultRole = isAdmin ? 'admin' : 'user'
  const roles = isAdmin ? ['user', 'admin', 'public'] : ['user', 'public']
  functions.logger.log('isAdmin', isAdmin)
  return await admin.auth().setCustomUserClaims(uid, {
    'https://hasura.io/jwt/claims': {
      'x-hasura-default-role': defaultRole,
      'x-hasura-allowed-roles': roles,
      'x-hasura-user-id': uid
    }
  })
    .then(async () => {
      await changeAdminInDatabase(uid, isAdmin)
    })
}

import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'

export const updateClaims = async (uid: string, isAdmin?: boolean) => {
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
}

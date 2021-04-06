import * as admin from 'firebase-admin'

export const updateClaims = (uid: string, isAdmin?: boolean) => {
  const defaultRole = isAdmin ? 'admin' : 'user'
  const roles = isAdmin ? ['user', 'admin'] : ['user']
  return admin.auth().setCustomUserClaims(uid, {
    'https://hasura.io/jwt/claims': {
      'x-hasura-default-role': defaultRole,
      'x-hasura-allowed-roles': roles,
      'x-hasura-user-id': uid
    }
  })
}

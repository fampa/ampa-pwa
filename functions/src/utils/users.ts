import * as admin from 'firebase-admin'
import { updateClaims } from './customClaims'

export const userCreated = async (user: admin.auth.UserRecord) => {
  console.log('user created', user.toJSON())
  await admin
    .auth()
    .listUsers(1)
    .then(async (listUsersResult) => {
      const isNotTheFirst = listUsersResult.users[0]
      console.log('listUsersResult', listUsersResult)
      if (isNotTheFirst) {
        await updateClaims(user.uid)
      } else {
        await updateClaims(user.uid, true)
      }
    })
}

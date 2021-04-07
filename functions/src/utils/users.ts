import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'
import { updateClaims } from './customClaims'

export const userCreated = async (user: admin.auth.UserRecord) => {
  functions.logger.log('user created', user.toJSON())
  await admin
    .auth()
    .listUsers(1)
    .then(async (listUsersResult) => {
      const isNotTheFirst = listUsersResult.users[0]
      functions.logger.log('listUsersResult', listUsersResult.users[0])
      if (isNotTheFirst) {
        functions.logger.log('isNotTheFirst', isNotTheFirst)
        await updateClaims(user.uid)
      } else {
        functions.logger.log('the first!', isNotTheFirst)
        await updateClaims(user.uid, true)
      }
    })
}

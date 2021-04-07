import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'
import { updateClaims } from './customClaims'

export const userCreated = async (user: admin.auth.UserRecord) => {
  functions.logger.log('user created', user.toJSON())
  const listUsers = await admin.auth().listUsers(2)
  const isNotTheFirst = listUsers.users.length > 1
  if (isNotTheFirst) {
    functions.logger.log('isNotTheFirst', isNotTheFirst)
    await updateClaims(user.uid)
  } else {
    functions.logger.log('the first!')
    await updateClaims(user.uid, true)
  }
}

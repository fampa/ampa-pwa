import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'
import { gql } from 'graphql-request'
import { updateClaims } from './customClaims'
import { graphqlClient } from './graphql'

const addUser = async (user: admin.auth.UserRecord, isAdmin: boolean) => {
  const variables = {
    uid: user.uid,
    email: user.email,
    firstname: user.displayName,
    phone: user.phoneNumber,
    isadmin: false
  }

  if (isAdmin) {
    variables.isadmin = true
  }

  const query = gql`mutation addMember($uid: String!, $email: String!, $firstname: String, $phone: String, $isadmin: Boolean) {
      insert_members(objects: {id: $uid, email: $email, firstname: $firstname, phone: $phone, isadmin: $isadmin}, on_conflict: {constraint: members_pkey, update_columns: [email, phone]}) {
        affected_rows
      }
    }
  `
  await graphqlClient(query, variables)
}

export const userCreated = async (user: admin.auth.UserRecord) => {
  functions.logger.log('user created', user.toJSON())
  const listUsers = await admin.auth().listUsers(2)
  const isNotTheFirst = listUsers.users.length > 1

  let isAdmin = false

  if (isNotTheFirst) {
    functions.logger.log('isNotTheFirst', isNotTheFirst)
    await updateClaims(user.uid)
  } else {
    functions.logger.log('the first!')
    await updateClaims(user.uid, true)
    isAdmin = true
  }

  await addUser(user, isAdmin)
}

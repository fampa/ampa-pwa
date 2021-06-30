import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'
import { gql } from 'graphql-request'
import { updateClaims } from './customClaims'
import { client } from './graphql'

const addUser = async (user: admin.auth.UserRecord, isAdmin = false) => {
  const variables = {
    uid: user.uid,
    email: user.email,
    firstname: user.displayName,
    phone: user.phoneNumber,
    isAdmin
  }

  const query = gql`mutation addMember($uid: String!, $email: String!, $firstname: String, $phone: String, $isAdmin: Boolean) {
      insert_members(objects: {id: $uid, email: $email, firstName: $firstname, phone: $phone, isAdmin: $isAdmin}, on_conflict: {constraint: members_pkey, update_columns: [email, phone]}) {
        affected_rows
      }
    }
  `
  await client.request(query, variables)
}

const removeUser = async (id: string) => {
  const variables = {
    id
  }

  const query = gql`mutation removeUser($id: String!) {
      delete_members_by_pk(id: $id) {
        id
      }
    }
  `
  await client.request(query, variables)
}

export const userCreated = async (user: admin.auth.UserRecord) => {
  functions.logger.log('user created', user.toJSON())
  const listUsers = await admin.auth().listUsers(2)
  const isNotTheFirst = listUsers.users.length > 1

  if (isNotTheFirst) {
    functions.logger.log('isNotTheFirst', isNotTheFirst)
    await updateClaims(user.uid).then(async () => await addUser(user))
  } else {
    functions.logger.log('the first is admin!')
    await updateClaims(user.uid, true).then(async () => await addUser(user, true))
  }
}

export const userRemoved = async (user: admin.auth.UserRecord) => {
  functions.logger.log('user removed', user.toJSON())
  const id = user.uid

  await removeUser(id)
}

export const importUsers = async (users) => {
  await admin
    .auth()
    .importUsers(users)
    .then((results) => {
      results.errors.forEach((indexedError) => {
        functions.logger.info(`Error importing user ${indexedError.index}`)
      })
    })
    .catch((error) => {
      functions.logger.error('Error importing users :', error)
    })
}

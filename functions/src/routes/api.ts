import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'
import 'firebase-functions'
import { gql } from 'graphql-request'
import graphqlClient from '../utils/graphql'
import express = require('express')
import cors = require('cors')
export const appApi: express.Application = express()

admin.initializeApp()

import { updateClaims } from '../utils/customClaims'

interface User {
  id: string,
  uid: string,
  isadmin: boolean,
  email: string
}

appApi.use(cors({ origin: true }))

appApi.post('/refresh-token', (req: express.Request, res: express.Response) => {
  const user = req.body as User
  console.log(user)
  if (!user) return

  console.log('TOKEN REFRESH', user.uid)
  updateClaims(user.uid).then(() => {
    return true
  })
    .then(() => {
      const mutation = gql`
          mutation insertUser($email: String!, $id: String!) {
            insert_members_one(object: {email: $email, id: $id}, on_conflict: {constraint: members_pkey, update_columns: email}) {
              id
            }
          }
          `
      const variables = {
        id: user.uid,
        email: user.email
      }
      return graphqlClient(mutation, variables).catch((error) => console.error(error))
    })
    .then((newUser) => {
      functions.logger.log('NewUser', newUser)
      return res.status(200).send('success')
    }).catch((error) => {
      functions.logger.error('REFRESH ERROR', error)
      return res.status(400).send(error)
    })
})

appApi.post('/webhook/change-claims', (req: express.Request, res: express.Response) => {
  const response = async () => {
    const user = req.body.event.data.new as User
    const isAdmin = !!user.isadmin
    await updateClaims(user.id, isAdmin)
    console.log(`user ${user.email} admin state:`, isAdmin)
    res.json({ data: { isAdmin: isAdmin } })
  }
  return response
})

appApi.get('/hello', (req: express.Request, res: express.Response) => {
  functions.logger.info('Hello logs!', { structuredData: true })
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const variable: string = functions.config().env.template.schoolName
  res.status(200).json({ results: 'Hola món', variable: variable })
  return res
})

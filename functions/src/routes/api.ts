import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'
import 'firebase-functions'
import { gql } from 'graphql-request'
import { graphqlClient } from '../utils/graphql'
import express from 'express'
import cors from 'cors'
export const appApi: express.Application = express()
import { Member } from '../../../src/models/Member'
import { sendEmail } from '../utils/sendEmail'

admin.initializeApp()

import { updateClaims } from '../utils/customClaims'

appApi.use(cors({ origin: true }))

appApi.post('/refresh-token', (req: express.Request, res: express.Response) => {
  const user = req.body as admin.auth.UserRecord
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
    const user = req.body.event.data.new as Member
    const isAdmin = !!user.isAdmin
    const id = user.id?.toString() || ''
    await updateClaims(id, isAdmin)
    console.log(`user ${user.email || ''} admin state:`, isAdmin)
    res.json({ data: { isAdmin: isAdmin } })
  }
  return response
})

appApi.post('/request/family-access', (req: express.Request, res: express.Response) => {
  const response = async () => {
    const requester = req.body.event.data.member as Member
    const familyId = Number(req.body.event.data.familyId)
    const query = gql`
          query findFamilyOwner($id: Int!) {
            families_by_pk(id: $id) {
              owner
              members {
                firstName
                lastName
                email
              }
            }
          }
          `
    const variables = {
      id: familyId
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data = await graphqlClient(query, variables).catch((error) => console.error(error))
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const member = data.families_by_pk.members[0]
    const owner = data.families_by_pk.owner as string
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const family = data.families_by_pk.name as string

    const joinRequestMutation = gql`mutation requestJoin($id: String!, $email: String!) {
      update_members_by_pk(pk_columns: {id: $id}, _set: {joinFamilyRequest: $email}) {
        updatedAt
      }
    }
    `
    const joinRequestVariables = {
      id: owner,
      email: requester.email
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const joinRequest = await graphqlClient(joinRequestMutation, joinRequestVariables).catch((error) => console.error(error))

    const messageObj = {
      name: requester.firstName || '',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      to: member.email || '',
      from: functions.config().env.smtp.username as string || '',
      subject: 'Sol·licitud d\'accés',
      message: `
      <p>Sol·licite accés a gestionar la família ${family} a la app de l'AMPA</p>
      <p>Per donar-me accés <a href="${functions.config().env.template.siteUrl as string}">entra a l'aplicació</a> i segueix les instruccions.</p>
      `
    }
    if (joinRequest) {
      const response = sendEmail(messageObj)
      return res.json(response)
    } else {
      return res.json('error requesting join')
    }
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

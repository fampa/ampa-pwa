import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'
import 'firebase-functions'
import { gql } from 'graphql-request'
import { client } from '../utils/graphql'
import express from 'express'
import cors from 'cors'
export const appApi: express.Application = express()
import { Member } from '../../../src/models/Member'
import { sendEmail } from '../utils/sendEmail'

admin.initializeApp()

import { updateClaims } from '../utils/customClaims'

const whitelist = [functions.config().env.template.siteUrl, 'http://localhost:3000', 'http://localhost:8080']
const corsOptions = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  origin: function (origin: string, callback: any) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      functions.logger.error(`${origin} Not allowed by CORS`)
      callback(new Error(`${origin} Not allowed by CORS`))
    }
  }
} as cors.CorsOptions
appApi.use(cors(corsOptions))

appApi.post('/refresh-token', (req: express.Request, res: express.Response) => {
  const user = req.body as admin.auth.UserRecord
  console.log(user)
  if (!user) return

  console.log('TOKEN REFRESH', user.uid)
  updateClaims(user.uid).then(() => {
    return true
  })
    .then(async () => {
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
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const data = await client.request(mutation, variables)
        console.log('data from server', data)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return data
      } catch (error) {
        console.error(JSON.stringify(error, undefined, 2))
        process.exit(1)
      }
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
    const user = req.body.new as Member
    const isAdmin = !!user.isAdmin
    const id = user.id?.toString() || ''
    await updateClaims(id, isAdmin)
    console.log(`user ${user.email || ''} admin state:`, isAdmin)
    res.json({ data: { isAdmin: isAdmin } })
  }
  return response
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
appApi.post('/request/family-access', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    functions.logger.info('request family accés initiated', req.body.member)
    const requester = req.body.member as Member
    const familyId = Number(req.body.familyId)
    const query = gql`
          query findFamilyOwner($id: Int!) {
            families_by_pk(id: $id) {
              ownerId
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
    const data = await client.request(query, variables).catch(err => functions.logger.error('findFamilyOwner error', err))
    console.log('data from server', data)
    functions.logger.info('query findFamilyOwner', data)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const member = data.families_by_pk.members[0]
    const ownerId = data.families_by_pk.ownerId as string
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const family = data.families_by_pk.name as string
    const joinRequestMutation = gql`mutation requestJoin($id: String!, $member: jsonb!) {
      update_members_by_pk(pk_columns: {id: $id}, _set: {joinFamilyRequest: $member}) {
        updatedAt
      }
    }
    `
    const joinRequestVariables = {
      id: ownerId,
      member: {
        id: requester.id,
        email: requester.email
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const joinRequest = await client.request(joinRequestMutation, joinRequestVariables).catch(err => functions.logger.error('requestJoin mutation error', err))
    functions.logger.info('mutation requestJoin', joinRequest)
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
      const response = await sendEmail(messageObj)
      functions.logger.info('response from sendEmail', response)
      return res.json(response)
    } else {
      return res.json('error requesting join')
    }
  } catch (error) {
    return next(error)
  }
})

appApi.get('/hello', (req: express.Request, res: express.Response) => {
  functions.logger.info('Hello logs!', { structuredData: true })
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const variable: string = functions.config().env.template.schoolName
  res.status(200).json({ results: 'Hola món', variable: variable })
  return res
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
appApi.post('/resolve/family-access', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const requester = req.body.member as Member
    const familyId = Number(req.body.familyId)
    const joinResolveMutation = gql`mutation requestJoin($id: String!, $familyId: Int!, $permission: Boolean!) {
      update_members_by_pk(pk_columns: {id: $id}, _set: {familyId: $familyId, hasRequestedJoinFamily: false}) {
        updatedAt
      }
    }
    `
    const joinResolveVariables = {
      id: requester.id,
      familyId
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const response = await client.request(joinResolveMutation, joinResolveVariables).catch(err => functions.logger.error('requestJoin mutation error', err))
    return res.json(response)
  } catch (error) {
    return next(error)
  }
})

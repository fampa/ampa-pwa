import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'
import 'firebase-functions'
import { gql } from 'graphql-request'
import { client } from '../utils/graphql'
import express from 'express'
import cors from 'cors'
export const appApi: express.Application = express()
import { Member } from '../../../src/models/Member'
import { sendEmail, MailObject } from '../utils/sendEmail'
import { validateFirebaseIdToken } from '../utils/validateFirebaseToken'
import cookieParser from 'cookie-parser'
import { manageCommunications } from '../utils/manageComunications'
import { v4 as uuidv4 } from 'uuid'
import { generatePdf } from '../utils/generatePdf'
import { formatDate } from '../utils/formatDate'
import { signedSubject, signedMessage, subject, message, title, mandateIdText, mandateText, debtorName, ibanNumber, paymentTypeText, recurrentPayment, oneOffPayment, signaturePlaceText, signatureText, signature, signatureDateText } from '../utils/mandateTranslations'

admin.initializeApp()

import { updateClaims } from '../utils/customClaims'
import { Attachment } from 'nodemailer/lib/mailer'

const mainUrl = functions.config().env.template.siteUrl
const otherUrl = functions.config().env.otherUrls?.replace(' ', '')?.split(',')

const whitelist = [...otherUrl, mainUrl]
const dev = !!process.env.FUNCTIONS_EMULATOR
if (dev) {
  whitelist.push('http://localhost:8080')
}
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
appApi.use(cookieParser())
appApi.use('/admin', validateFirebaseIdToken)

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

// eslint-disable-next-line @typescript-eslint/no-misused-promises
appApi.post('/admin/change-claims', async (req: express.Request, res: express.Response) => {
  const member = req.body.member as Member
  functions.logger.info('changing admin privileges of', member)
  const isAdmin = !member.isAdmin
  const id = member.id
  await updateClaims(id, isAdmin)
  functions.logger.info(`member ${member.email} admin state:`, isAdmin)
  return res.json({ isAdmin: isAdmin })
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
      name: 'AMPA',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      to: [member.email],
      from: functions.config().env.smtp.username as string || '',
      subject: `${requester.email} ha sol·licitat accés a la app`,
      message: `
        <p>L'usuari ${requester.email} ha sol·licitat accés a gestionar la família a la app de l'AMPA</p>
        <p>Per donar-li accés <a href="${functions.config().env.template.siteUrl as string}/user/family">entra a l'aplicació</a> i segueix les instruccions.</p>
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
    functions.logger.log('Resolved join family', requester.email)
    const joinResolveMutation = gql`mutation requestJoin($id: String!, $familyId: Int!) {
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
    functions.logger.log('response from resolve join family', response)
    return res.json(response)
  } catch (error) {
    return next(error)
  }
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
appApi.post('/contact', async (req: express.Request, res:express.Response /*, next:express.NextFunction */) => {
  const obj = req.body as MailObject
  obj.to = functions.config().env.template.email
  obj.bcc = obj.from
  obj.sender = obj.from
  obj.replyTo = obj.from
  obj.from = `AMPA <${functions.config().env.template.email}>`
  obj.template = 'contact'

  try {
    const result = await sendEmail(obj)

    functions.logger.info('Contact form sendEmail result:', result)
    return res.json(result)
  } catch (error) {
    functions.logger.error(error)
    return res.status(500).json({ error })
  }
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
appApi.post('/service', async (req: express.Request, res:express.Response /*, next:express.NextFunction */) => {
  const obj = req.body as MailObject
  obj.to = functions.config().env.template.email
  obj.bcc = obj.from
  obj.subject = 'Servei de l\'AMPA sol.licitat'
  obj.sender = obj.from
  obj.replyTo = obj.from
  obj.from = `AMPA <${functions.config().env.template.email}>`

  try {
    const result = await sendEmail(obj)

    functions.logger.info('Service Requested:', result)
    return res.json(result)
  } catch (error) {
    functions.logger.error(error)
    return res.status(500).json({ error })
  }
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
appApi.post('/webhook/message', async (req: express.Request, res:express.Response /*, next:express.NextFunction */) => {
  functions.logger.log('req.body', req.body)

  const message = req.body?.event?.data?.new

  const query = `query getMembersMessagesByMessageId($messageId: Int!) {
    members_messages(where: {messageId: {_eq: $messageId}}) {
      message {
        id
        title
        content
        createdAt
      }
      member {
        id
        canEmail
        firstName
        lastName
        email
        pushTokens {
          token
        }
      }
    }
  }`

  const variables = {
    messageId: message.id
  }
  try {
    const data = await client.request(query, variables)
    const memberMessages = data.members_messages
    for (const m of memberMessages) {
      const member = m.member
      const message = m.message
      await manageCommunications({ member, message })
    }
    return res.json({ success: true, error: null })
  } catch (error) {
    functions.logger.error(error)
    return res.json({ success: false, error: error })
  }
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
appApi.post('/mandate/send', async (req: express.Request, res:express.Response /*, next:express.NextFunction */) => {
  functions.logger.log('mandate/send req.body', req.body)

  const id = req.body.id
  const member = req.body.member as Member
  const language = req.body.language || 'ca'

  const email = member.email
  const name = member.firstName

  // Generate signature code
  const mandateSignatureCode = uuidv4()
  const now = Date.now()
  const mandateId = `${member.nif}T${now}`

  const mutation = gql`
          mutation updateFamilyMandateSignatureCode($id: Int!, $mandateSignatureCode: uuid!, $mandateId: String!) {
              update_families_by_pk(pk_columns: {id: $id}, _set: {mandateSignatureCode: $mandateSignatureCode, mandateId: $mandateId, signatureDate: null}) {
                mandateSignatureCode
                mandateId
                signatureDate
              }
            }
          `
  const variables = {
    id,
    mandateSignatureCode,
    mandateId
  }
  try {
    await client.request(mutation, variables)
    const mandateLink = `${functions.config().env.template.siteUrl}/user/payment?t=${now}&c=${mandateSignatureCode}`

    const messageTemp = message({ mandateLink, name })
    const mandateIdTemp = mandateIdText({ mandateId })
    const mandateTextTemp = mandateText({ schoolName: functions.config().env.template.schoolName })

    const pdfData = {
      title: title[language],
      mandateId: mandateIdTemp[language],
      mandateText: mandateTextTemp[language],
      debtorName: debtorName[language],
      ibanNumber: ibanNumber[language],
      debtor: `${member.firstName} ${member.lastName}`,
      iban: member?.family?.iban,
      paymentTypeText: paymentTypeText[language],
      recurrentPayment: recurrentPayment[language],
      oneOffPayment: oneOffPayment[language],
      signaturePlaceText: signaturePlaceText[language],
      signaturePlace: 'Alboraia',
      signatureText: signatureText[language],
      signatureDateText: signatureDateText[language]
    }

    const pdf = await generatePdf(pdfData)

    const messageObj = {
      to: email,
      subject: subject[language],
      from: `AMPA <${functions.config().env.template.email}>`,
      message: messageTemp[language],
      attachments: [
        {
          filename: `mandate-${mandateId}.pdf`,
          content: pdf
        }
      ] as Attachment[]
    }
    await sendEmail(messageObj)
    return res.json({ success: true, error: null })
  } catch (error) {
    functions.logger.error(error)
    return res.json({ success: false, error: error })
  }
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
appApi.post('/mandate/sign', async (req: express.Request, res:express.Response /*, next:express.NextFunction */) => {
  functions.logger.log('mandate/sign req.body', req.body)

  const id = req.body.id
  const member = req.body.member as Member
  const language = req.body.language || 'ca'
  const mandateSignatureCode = req.body.mandateSignatureCode

  const email = member.email

  // Generate signature code
  const signatureDate = new Date()

  const mutation = gql`
          mutation updateFamilyMandateSignatureDate($id: Int!, $signatureDate: date!, $mandateSignatureCode: uuid!) {
            update_families(_set: {signatureDate: $signatureDate}, where: {id: {_eq: $id}, mandateSignatureCode: {_eq: $mandateSignatureCode}}) {
              returning {
                mandateId
                signatureDate
              }
            }
          }
          `
  const variables = {
    id,
    signatureDate,
    mandateSignatureCode
  }
  try {
    const result = await client.request(mutation, variables)
    const mandateId = result.data?.update_families?.returning[0]?.mandateId
    const mandateIdTemp = mandateIdText({ mandateId })
    const mandateTextTemp = mandateText({ schoolName: functions.config().env.template.schoolName })
    const signatureDate = result.data?.update_families?.returning[0]?.signatureDate

    const pdfData = {
      title: title[language],
      mandateId: mandateIdTemp[language],
      mandateText: mandateTextTemp[language],
      debtorName: debtorName[language],
      ibanNumber: ibanNumber[language],
      debtor: `${member.firstName} ${member.lastName}`,
      iban: member?.family?.iban,
      paymentTypeText: paymentTypeText[language],
      recurrentPayment: recurrentPayment[language],
      oneOffPayment: oneOffPayment[language],
      signaturePlaceText: signaturePlaceText[language],
      signaturePlace: 'Alboraia',
      signatureText: signatureText[language],
      signature: signature[language],
      signatureDateText: signatureDateText[language],
      signatureDate: formatDate(signatureDate)
    }

    const pdf = await generatePdf(pdfData)

    const messageObj = {
      to: email,
      subject: signedSubject[language],
      from: `AMPA <${functions.config().env.template.email}>`,
      bcc: `AMPA <${functions.config().env.template.email}>`,
      message: signedMessage[language],
      attachments: [
        {
          filename: `mandate-${mandateId}-signed.pdf`,
          content: pdf
        }
      ] as Attachment[]
    }
    await sendEmail(messageObj)
    return res.json({ success: true, error: null })
  } catch (error) {
    functions.logger.error(error)
    return res.json({ success: false, error: error })
  }
})

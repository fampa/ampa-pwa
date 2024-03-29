import * as functions from 'firebase-functions'

import { appApi } from './routes/api'
import { userCreated, userRemoved } from './utils/users'

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld: functions.HttpsFunction = functions.region('europe-west1').https.onRequest((request, response) => {
//   functions.logger.info('Hello logs!', { structuredData: true })
//   response.status(200).json({ results: 'Hola món' })
// })

export const api: functions.HttpsFunction = functions.https.onRequest(appApi)

export const onUserCreated: functions.HttpsFunction = functions.auth.user().onCreate(userCreated)

export const onUserRemoved: functions.HttpsFunction = functions.auth.user().onDelete(userRemoved)

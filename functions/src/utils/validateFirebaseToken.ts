import admin from 'firebase-admin'
import * as functions from 'firebase-functions'

export const validateFirebaseIdToken = (req, res, next) => {
  functions.logger.info('Check if request is authorized with Firebase ID token')

  if ((!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) &&
        !req.cookies.__session) {
    functions.logger.error('No Firebase ID token was passed as a Bearer token in the Authorization header.',
      'Make sure you authorize your request by providing the following HTTP header:',
      'Authorization: Bearer <Firebase ID Token>',
      'or by passing a "__session" cookie.')
    res.status(403).send('Unauthorized')
    return
  }

  let idToken
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    functions.logger.info('Found "Authorization" header')
    // Read the ID Token from the Authorization header.
    idToken = req.headers.authorization.split('Bearer ')[1]
  } else {
    functions.logger.info('Found "__session" cookie')
    // Read the ID Token from cookie.
    idToken = req.cookies.__session
  }
  // Verify the ID token first.
  admin.auth().verifyIdToken(idToken).then((claims) => {
    functions.logger.info('claims.admin', claims)
    const isAdmin = claims['https://hasura.io/jwt/claims']['x-hasura-default-role'] === 'admin'
    if (isAdmin) {
      next()
    } else {
      res.status(403).send('Unauthorized')
    }
  }).catch(error => {
    functions.logger.error('Error while verifying Firebase ID token:', error)
    res.status(403).send('Unauthorized')
  })
}

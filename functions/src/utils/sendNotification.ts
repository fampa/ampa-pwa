import admin from 'firebase-admin'
import * as functions from 'firebase-functions'

export const sendPushNotification = async obj => {
  const tokens = obj.member.pushTokens.map(t => t.token)
  functions.logger.log(`Initiated sending notifications ${tokens.toString()}`)
  const message = {
    tokens,
    webpush: {
      headers: {
        Urgency: 'high'
      },
      notification: {
        title: obj.message.title,
        body: obj.message.content,
        requireInteraction: true,
        timestamp: obj.message.createdAt || Date.parse(new Date().toString()),
        badge: '/statics/icons/icon-512x512.png',
        icon: '/statics/icons/icon-128x128.png',
        click_action: obj.click_action || functions.config().env.template.siteUrl
      }
    }
  }
  if (tokens?.length === 0) {
    functions.logger.log('No token to sent to')
    return 'nothing to do'
  }
  const sending = await admin
    .messaging()
    .sendMulticast(message)
    .then(response => {
      functions.logger.log('message trying to be sent:', message)
      functions.logger.log('response from push sending:', response)
      if (response.failureCount > 0) {
        const failedTokens = []
        return response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            functions.logger.error('error', resp.error)
            functions.logger.error(`List of tokens that caused failures: ${failedTokens}`)
            return failedTokens.push(tokens[idx])
          }
          return 'end of failing tokens'
        })
      }
      functions.logger.log('Push Messages sent successfully')
      return 'Messages sent successfully'
    })
    .catch(err => functions.logger.error(err))

  return sending
}

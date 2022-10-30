import * as functions from 'firebase-functions'
import 'firebase-functions'
import { Member } from '../../../src/models/Member'
import { Message } from '../../../src/models/Message'
import { sendEmail } from './sendEmail'
import { sendPushNotification } from './sendNotification'

export const manageCommunications = async (params: {message: Message, member: Member}) => {
  const { member, message } = params
  functions.logger.info(member, message)
  const validateEmail = (email: string): boolean => {
    const emailPattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/
    return emailPattern.test(email)
  }
  if (member.canEmail && validateEmail(member.email)) {
    const mailObj = {
      to: member.email,
      name: member.firstName,
      subject: message.title,
      message: message.content
    }
    await sendEmail(mailObj)
  }
  // TODO implementar enviaments push
  if (member.pushTokens.length > 0) {
    message.click_action = `${functions.config().env.template.siteUrl}/user/message/${message.id}`
    await sendPushNotification({ member, message })
  }
}

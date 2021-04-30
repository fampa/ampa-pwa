import hbs from 'nodemailer-express-handlebars'
import * as nodemailer from 'nodemailer'
import * as functions from 'firebase-functions'
import 'firebase-functions'
import SMTPTransport from 'nodemailer/lib/smtp-transport'

export interface MailObject {
  name: string,
  to: string,
  from: string,
  subject: string,
  message: string,
  template?: string
}

export function sendEmail (obj: MailObject): Record<string, unknown> {
  const transportOptions: SMTPTransport.Options = {
    host: functions.config().env.smtp.host as string,
    port: Number(functions.config().env.smtp.port),
    auth: {
      user: functions.config().env.smtp.username as string,
      pass: functions.config().env.smtp.password as string
    }
  }

  const transport = nodemailer.createTransport(transportOptions)

  const options = {
    viewEngine: {
      extname: '.hbs', // handlebars extension
      layoutsDir: 'views/email/', // location of handlebars templates
      defaultLayout: 'contact', // name of main template
      partialsDir: 'views/email/' // location of your subTemplates aka. header, footer etc
    },
    viewPath: 'views/email',
    extName: '.hbs'
  }

  transport.use('compile', hbs(options))

  const message = {
    from: obj.from, // Sender address
    to: obj.to,
    replyTo: obj.to, // List of recipients
    subject: obj.subject,
    // text: obj.message,
    // html: html
    template: obj.template || 'default',
    context: {
      name: obj.name,
      email: obj.to,
      subject: obj.subject,
      message: obj.message
    }
  }
  let result

  transport.sendMail(message, function (err, info: string) {
    if (err) {
      functions.logger.error('error al enviar correu de contacte', err)
      result = {
        success: false,
        error: err
      }
    } else {
      functions.logger.info('correu de contacte enviat correctament', info)
      result = {
        success: true,
        error: null
      }
    }
  })

  return result
}

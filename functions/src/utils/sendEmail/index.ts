import hbs from 'nodemailer-express-handlebars'
import * as nodemailer from 'nodemailer'
import * as functions from 'firebase-functions'
import 'firebase-functions'
import SMTPTransport from 'nodemailer/lib/smtp-transport'
import path from 'path'

export interface MailObject {
  name: string,
  to: string | Array<string>,
  from: string,
  subject: string,
  message: string,
  bcc?: string | Array<string>,
  replyTo?: string,
  template?: string
}

interface Result {
  success: boolean,
  error: Error | null
}

export async function sendEmail (obj: MailObject): Promise<Result> {
  const transportOptions: SMTPTransport.Options = {
    host: functions.config().env.smtp.host as string,
    port: Number(functions.config().env.smtp.port),
    auth: {
      user: functions.config().env.smtp.username as string,
      pass: functions.config().env.smtp.password as string
    },
    tls: {
      rejectUnauthorized: false
    }
  }

  const transport = nodemailer.createTransport(transportOptions)

  const options = {
    viewEngine: {
      extname: '.hbs', // handlebars extension
      layoutsDir: path.resolve(__dirname, 'views/layout/'), // location of handlebars templates
      defaultLayout: false, // name of main template
      partialsDir: path.resolve(__dirname, 'views/partials/') // location of your subTemplates aka. header, footer etc
    },
    viewPath: path.resolve(__dirname, 'views/layout/'),
    extName: '.hbs',
    defaultLayout: false
  }

  transport.use('compile', hbs(options))
  // TODO renderitzar missatge com a html
  const message = {
    from: obj.from, // Sender address
    to: obj.to,
    replyTo: obj.replyTo || obj.from, // List of recipients
    bcc: obj.bcc,
    subject: obj.subject,
    // text: obj.message,
    // html: html
    template: obj.template || 'default',
    context: {
      name: obj.name,
      email: obj.from,
      subject: obj.subject,
      message: obj.message,
      templateVars: functions.config().env.template as Record<string, unknown>
    }
  }

  functions.logger.info('Contingut del missatge', message)

  return new Promise((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    transport.sendMail(message, function (err, info: string) {
      if (err) {
        functions.logger.error('error al enviar correu', err)
        reject({
          success: false,
          error: err
        })
      } else {
        functions.logger.info('correu enviat correctament', info)
        resolve({
          success: true,
          error: null
        })
      }
    })
  })
}

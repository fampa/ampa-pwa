import * as express from 'express'
import 'firebase-functions'
import { MailObject, sendEmail } from '../utils/sendEmail'

module.exports = function (app: express.Application) {
  // contact form
  app.post('/contact', (req: express.Request, res:express.Response /*, next:express.NextFunction */) => {
    const obj = req.body as MailObject

    obj.template = 'contact'

    const result = sendEmail(obj)

    return res.json(result)
  })
}

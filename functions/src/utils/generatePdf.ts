import PDFDocument from 'pdfkit'
import * as functions from 'firebase-functions'
import fetch from 'node-fetch'

const fetchImage = async (src: string) => {
  const response = await fetch(src)
  const image = await response.buffer()

  return image
}

export const generatePdf = async (data: { image?: string, title?: string, mandateId?: string, mandateText?: string, debtorName?: string, ibanNumber?: string, debtor?: string, iban?: string, paymentTypeText?: string, recurrentPayment?: string, onOffPayment?: string, signaturePlaceText?: string, signaturePlace?: string, signatureText?: string, signature?: string, signatureDateText?: string, signatureDate?: string}) => {
  const img = await fetchImage(data.image || functions.config().env.template.emailLogoUrl)

  const pdfBuffer = await new Promise(resolve => {
    const doc = new PDFDocument()
    // Header
    doc
      .fillColor('#444444')
      .fontSize(16)
      .font('Helvetica-Bold')
      .text(data.title, 30, 45)
      .fontSize(12)
      .font('Helvetica')
      .text(data.mandateId, 30, 65)
      .image(img, 365, 35,
        {
          fit: [180, 60],
          align: 'right',
          valign: 'top'
        })
      .fontSize(14)
      .text(`AMPA ${functions.config().env.template.schoolName}`, 220, 120, { align: 'right' })
      .fontSize(10)
      .text(`NIF ${functions.config().env.template.nif}`, 200, 155, { align: 'right' })
      .text(`Reg. Assoc.: ${functions.config().env.template.numRegAssoc}`, 200, 170, { align: 'right' })
      .text(functions.config().env.template.address, 200, 185, { align: 'right' })
      .text(`${functions.config().env.template.postalCode}-${functions.config().env.template.city}`, 200, 200, { align: 'right' })
      .text(`(${functions.config().env.template.province})`, 200, 215, { align: 'right' })
      .moveDown()

    // Body
    doc
      .text(data.mandateText, 30, 240, { align: 'justify' })
      .moveDown()
      .moveDown()
      .fontSize(12)
      .font('Helvetica-Bold').text(data.debtorName, { continued: true }).font('Helvetica').text(data.debtor)
      .font('Helvetica-Bold').text(data.ibanNumber, { continued: true }).font('Helvetica').text(data.iban)
      .font('Helvetica-Bold').text(data.paymentTypeText, { continued: true }).font('Helvetica').text(data.recurrentPayment)
      .font('Helvetica-Bold').text(data.signaturePlaceText, { continued: true }).font('Helvetica').text(data.signaturePlace)
      .font('Helvetica-Bold').text(data.signatureDateText, { continued: true }).font('Helvetica').text(data.signatureDate)
      .moveDown(5)
      .font('Helvetica-Bold').text(data.signatureText)
    if (data.signature) {
      doc.font('Helvetica-Bold').text(data.signature, { continued: true }).font('Helvetica').text(data.signatureDate)
    }
    doc.end()

    // Finalize document and convert to buffer array
    const buffers = []
    doc.on('data', buffers.push.bind(buffers))
    doc.on('end', () => {
      const pdfData = new Uint8Array(Buffer.concat(buffers))
      resolve(pdfData)
    })
  })

  return pdfBuffer
}

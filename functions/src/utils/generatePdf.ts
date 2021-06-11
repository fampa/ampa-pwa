import PDFDocument from 'pdfkit'
import * as functions from 'firebase-functions'
import fetch from 'node-fetch'

const fetchImage = async (src: string) => {
  const response = await fetch(src)
  const image = await response.buffer()

  return image
}

export const generatePdf = async (data: { image?: string, title?: string }) => {
  const img = await fetchImage(data.image || functions.config().env.template.emailLogoUrl)

  const pdfBuffer = await new Promise(resolve => {
    const doc = new PDFDocument()
    // Header
    doc
      .fillColor('#444444')
      .fontSize(16)
      .text(data.title, 30, 45)
      .image(img)
      .fontSize(14)
      .text(`AMPA ${functions.config().env.template.schoolName}`, 200, 45, { align: 'right' })
      .fontSize(10)
      .text(`NIF ${functions.config().env.template.nif}`, 200, 60, { align: 'right' })
      .text(`Reg. Assoc.: ${functions.config().env.template.numRegAssoc}`, 200, 75, { align: 'right' })
      .text(functions.config().env.template.address, 200, 90, { align: 'right' })
      .moveDown()

    doc.text('hello world', 30, 400)
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

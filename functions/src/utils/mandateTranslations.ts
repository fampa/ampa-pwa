export const subject = {
  ca: 'Manament de domiciliació',
  es: 'Mandato de domiciliación'
}

export const message = ({ name, mandateLink }) => {
  return {
    ca: `
    <h2>Manament de domiciliació bancària</h2>

    <p>Hola ${name}.</p>

    <p>Si estàs d'acord amb el contingut del manament de domiciliació adjunt, fes click al següent botó per a signar-lo:</p>

    <p style="text-align: center">
      <a href="${mandateLink}" class="button" target="_blank" rel="noopener noreferrer">Signa el manament</a>
    </p>

    <p>Si ho prefereixes també pots copiar i enganxar el següent enllaç al teu navegador:</p>

    <p>${mandateLink}</p>

    <p>Aquest enllaç només serà vàlid 24 hores.</p>
    `,
    es: `
    <h2>Mandato de domiciliación bancaria</h2>

    <p>Hola ${name}.</p>

    <p>Si estás de acuerdo con el contenido del mandato de domiciliación bancaria adjunto, haz click en el siguiente enlace apara firmarlo:</p>

    <p style="text-align: center">
      <a href="${mandateLink}" class="button" target="_blank" rel="noopener noreferrer">Firmar el mandato</a>
    </p>
    
    <p>Si lo prefieres también puedes copiar y pegar el siguiente enlace en tu navegador:</p>

    <p>${mandateLink}</p>

    <p>Este enlace sólo será válido 24 horas</p>
    `
  }
}

export const title = {
  ca: 'Ordre SEPA de domiciliació de dèbit directe ',
  es: 'Orden de domiciliación de adeudo directo SEPA'
}

export const mandateIdText = ({ mandateId }) => {
  return {
    ca: `Referència de l'ordre de domiciliació: ${mandateId}`,
    es: `Referencia de la orden de domiciliación: ${mandateId}`
  }
}

export const mandateText = ({ schoolName }) => {
  return {
    ca: `Mitjançant la signatura d'aquest formulari d'ordre de domiciliació, autoritzeu a (A) AMPA ${schoolName} a enviar ordres a la vostra entitat financera per debitar càrrecs al vostre compte i (B) a la seva entitat financera per debitar els imports corresponents al vostre compte d'acord amb les instruccions de l'AMPA ${schoolName}. Entre altres, teniu dret a ser reemborsat per la vostra entitat financera d'acord amb els termes i condicions del contracte subscrit amb la vostra entitat financera. En tot cas aquest reemborsament haurà de ser instat per part vostre en el termini màxim de 8 setmanes a partir de la data en que es va debitar en el seu compte.`,
    es: `Mediante la firma de esta orden de domiciliación, el deudor autoriza a (A) AMPA ${schoolName} a enviar instrucciones a la entidad del deudor para adeudar su cuenta y (B) a la entidad para efectuar los adeudos en su cuenta siguiendo las instrucciones del AMPA ${schoolName}. Como parte de sus derechos, el deudor está legitimado al reembolso por su entidad  en los términos y condiciones del contrato suscrito con la misma. La solicitud de reembolso deberá efectuarse dentro de las ocho semanas que siguen a la fecha de adeudo en cuenta.`
  }
}

export const debtorName = {
  ca: 'Nom del(s) deutor(s): ',
  es: 'Nombre del deudor/res: '
}

export const ibanNumber = {
  ca: 'Número de compte – IBAN: ',
  es: 'Número de cuenta – IBAN: '
}

export const paymentTypeText = {
  ca: 'Tipus de pagament: ',
  es: 'Tipo de pago: '
}

export const recurrentPayment = {
  ca: 'Pagament periòdic',
  es: 'Pago periódico'
}

export const oneOffPayment = {
  ca: 'Pagament únic',
  es: 'Pago único'
}

export const signaturePlaceText = {
  ca: 'Localitat de la signatura: ',
  es: 'Localidad de la firma: '
}

export const signatureDateText = {
  ca: 'Data de la signatura: ',
  es: 'Fecha de la firma: '
}

export const signatureText = {
  ca: 'Signatura: ',
  es: 'Firma: '
}

export const signature = {
  ca: 'Document signat digitalment el dia ',
  es: 'Documento firmado digitalmente el día '
}

export const signedSubject = {
  ca: 'Manament de domiciliació signat',
  es: 'Mandato de domiciliación firmado'
}

export const signedMessage = {
  ca: 'Adjuntem el manament de domiciliació signat per correu electrònic',
  es: 'Adjuntamos el mandato de domiciliación firmado por correo electrónico'
}

export const signatureCodeText = {
  ca: 'Codi de signatura ',
  es: 'Código de firma '
}

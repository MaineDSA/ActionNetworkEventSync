/* eslint-disable no-unused-vars */
// Creates a new Action Network Email Message with the provided HTML-formatted text as the body.
// Values for Subject, Sender, Reply-To, Origin System, and Wrapper are obtained via defined Script Properties.
function draftANMessage (doc, apiKey) {
  const emailReplyTo = scriptProperties.getProperty('AN_EMAIL_REPLY_TO')
  const emailSender = scriptProperties.getProperty('AN_EMAIL_SENDER')
  const emailWrapper = scriptProperties.getProperty('AN_EMAIL_WRAPPER')
  const emailCreator = scriptProperties.getProperty('AN_EMAIL_CREATOR')
  const emailTarget = scriptProperties.getProperty('EMAIL_TARGET')
  const emailSubject = scriptProperties.getProperty('EMAIL_SUBJECT')

  if (!apiKey) {
    console.error('No Action Network Api Key "AN_API_KEY" provided, cannot continue.')
    return
  }
  if (!emailReplyTo) {
    console.error('No Email Reply-To Address "AN_EMAIL_REPLY_TO" provided, cannot continue.')
    return
  }
  if (!emailSubject) {
    console.error('No Email Subject "EMAIL_SUBJECT" provided, cannot continue.')
    return
  }

  const subject = `🌹 ${emailSubject} for ${Utilities.formatDate(new Date(), 'UTC', 'yyyy-MM-dd')} 🫎`

  const payload = {
    subject,
    body: doc,
    from: emailSender,
    origin_system: 'ActionNetworkEventSync',
    reply_to: emailReplyTo,
    _links: {}
  }

  payload.targets = emailTarget
    ? [
        {
          href: `${apiUrlAn}queries/${emailTarget}`
        }
      ]
    : undefined

  payload._links['osdi:wrapper'] = emailWrapper
    ? {
        href: `${apiUrlAn}wrappers/${emailWrapper}`
      }
    : undefined

  payload._links['osdi:creator'] = emailCreator
    ? {
        href: `${apiUrlAn}people/${emailCreator}`
      }
    : undefined

  const options = {
    method: 'post',
    payload: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
      'OSDI-API-Token': apiKey
    }
  }

  const response = UrlFetchApp.fetch(`${apiUrlAn}messages/`, options)
  const actionNetworkId = getEventIDFromAN(JSON.parse(response), 'action_network')
  console.log(`Created Action Network Message ${actionNetworkId} with subject ${subject}.`)
}

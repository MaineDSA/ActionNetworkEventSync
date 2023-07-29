// Creates a new Action Network Email Message with the provided HTML-formatted text as the body.
// Values for Subject, Sender, Reply-To, Origin System, and Wrapper are obtained via defined Script Properties.
const draftANMessage = (doc) => {

  if (scriptProperties.getProperty("AN_API_KEY") === null) { Logger.log('No Action Network Api Key "AN_API_KEY" provided, cannot continue.'); return }
  if (scriptProperties.getProperty("AN_EMAIL_REPLY_TO") === null) { Logger.log('No Email Reply-To Address "AN_EMAIL_REPLY_TO" provided, cannot continue.'); return }
  if (scriptProperties.getProperty("AN_EMAIL_WRAPPER") === null) { Logger.log('No Action Network Email Wrapper Address "AN_EMAIL_WRAPPER" provided, cannot continue.'); return }
  if (scriptProperties.getProperty("AN_EMAIL_CREATOR") === null) { Logger.log('No Action Network email creator UUID "AN_EMAIL_CREATOR" provided, cannot continue.'); return }
  if (scriptProperties.getProperty("EMAIL_SUBJECT") === null) { Logger.log('No email subject "EMAIL_SUBJECT" provided, cannot continue.'); return }

  const subject = scriptProperties.getProperty("EMAIL_SUBJECT") + ' for ' + Utilities.formatDate(new Date(), "UTC", "yyyy-MM-dd") + ' 🌹'

  // Creates payload for POST request to Action Network
  let payload = {
    "subject": subject,
    "body": doc,
    "from": scriptProperties.getProperty("AN_EMAIL_SENDER"),
    "origin_system": "ActionNetworkEventSync",
    "reply_to": scriptProperties.getProperty("AN_EMAIL_REPLY_TO"),
    "_links": {
      "osdi:wrapper": { "href": apiUrlAn + "wrappers/" + scriptProperties.getProperty("AN_EMAIL_WRAPPER") },
      "osdi:creator": { "href": apiUrlAn + "people/" + scriptProperties.getProperty("AN_EMAIL_CREATOR") },
    }
  }

  if (scriptProperties.getProperty("EMAIL_TARGET") != null) {
    payload.targets = [{ "href": apiUrlAn + "queries/" + scriptProperties.getProperty("EMAIL_TARGET") }]
    Logger.log('Message targeting query: ' + scriptProperties.getProperty("EMAIL_TARGET"))
  }

  // Sets options and sends request to Action Network, logs with "action_network" identifier after completion.
  const options = {
    method: "post",
    payload: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
      'OSDI-API-Token': scriptProperties.getProperty("AN_API_KEY")
    }
  }

  const response = UrlFetchApp.fetch(apiUrlAn + "messages/", options)
  const action_network_id = getEventIDFromAN(JSON.parse(response), "action_network")
  Logger.log("Created Action Network Message " + action_network_id + " with subject " + subject + '.')

}

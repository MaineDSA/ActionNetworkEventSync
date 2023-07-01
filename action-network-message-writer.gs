// Creates a new Action Network Email Message with the provided HTML-formatted text as the body.
// Values for Subject, Sender, Reply-To, Origin System, and Wrapper are obtained via defined Script Properties.
const draftANMessage = (doc) => {

  const subject = '🌹 ' + scriptProperties.getProperty("AN_EMAIL_SUBJECT") + ' for ' + Utilities.formatDate(new Date(), "UTC", "yyyy-MM-dd") + ' 🌹'

  // Creates payload for POST request to Action Network
  const payload = JSON.stringify({
    "subject": subject,
    "body": doc,
    "from": scriptProperties.getProperty("AN_EMAIL_SENDER"),
    "origin_system": scriptProperties.getProperty("AN_ORIGIN_SYSTEM"),
    "reply_to": scriptProperties.getProperty("AN_EMAIL_REPLY_TO"),
    "_links": {
      "osdi:wrapper": {
        "href": scriptProperties.getProperty("AN_API_URL") + "wrappers/" + scriptProperties.getProperty("AN_EMAIL_WRAPPER")
        },
      "osdi:creator": {
        "href": scriptProperties.getProperty("AN_API_URL") + "people/" + scriptProperties.getProperty("AN_EMAIL_CREATOR")
        },
    }
  })

  // Sets options and sends request to Action Network, logs with "action_network" identifier after completion.
  const options = {
    method: "post",
    payload: payload,
    headers: {
      'Content-Type': 'application/json',
      'OSDI-API-Token': scriptProperties.getProperty("AN_API_KEY")
    }
  }

  const response = UrlFetchApp.fetch(scriptProperties.getProperty("AN_API_URL") + "messages/", options)
  const action_network_id = getEventIDFromAN(JSON.parse(response), "action_network")
  Logger.log("Created Action Network Message " + action_network_id + " with subject " + subject + '.')

}

// Calls the draftANMessage function with the output of the compileHTMLEmail() function as an argument.
const draftANEventMessage= () => {

  draftANMessage(compileHTMLEmail(getUpcomingEventDateFilter(days_upcoming_email)))

}

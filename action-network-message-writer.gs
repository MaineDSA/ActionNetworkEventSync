const draftANMessage = () => {
  // creates payload for POST request to Action Network, creating new email draft with upcoming events as the body 
  const payload = JSON.stringify({
    "subject": scriptProperties.getProperty("AN_EMAIL_SUBJECT"),
    "body": compileHTMLMessage(),
    "from": scriptProperties.getProperty("AN_EMAIL_SENDER"),
    "origin_system": scriptProperties.getProperty("AN_ORIGIN_SYSTEM"),
    "reply_to": scriptProperties.getProperty("AN_EMAIL_REPLY_TO"),
    "_links": {
      "osdi:wrapper": { "href": scriptProperties.getProperty("AN_EMAIL_WRAPPER") }
      }
    })

  // sets options and sends request to Action Network, logs response
  const options = {
    method: "post",
    payload: payload,
		headers: {
			'Content-Type': 'application/json',
			'OSDI-API-Token': scriptProperties.getProperty("AN_API_KEY")
		}
	}

  const response = UrlFetchApp.fetch(scriptProperties.getProperty("AN_API_URL") + "messages/", options)
  const action_network_id = getEventIDFromAN(JSON.parse(response), "action_network" + ":[^,]*")
  Logger.log("Created Action Network Message " + action_network_id + ".")
}

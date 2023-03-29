const tagANEvent = async (action_network_id, google_id) => {
	Logger.log("Tagging Action Network event " + action_network_id + "with Google Calendar event ID " + google_id)

	// creates payload for PUT request to Action Network, adding google_id as an identifier on the event 
	const payload = JSON.stringify({ "identifiers": [ "google_id:" + google_id ] })

	// sets options and sends request to Action Network, logs response
	const options = {
		method: "put",
		payload: payload,
		headers: {
			'Content-Type': 'application/json',
			'OSDI-API-Token': scriptProperties.getProperty("AN_API_KEY")
		}
	}

	UrlFetchApp.fetch(scriptProperties.getProperty("AN_API_URL") + "events/" + action_network_id, options)
}

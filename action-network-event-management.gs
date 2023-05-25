// This function tags an Action Network event with the Google ID for its corresponding Google Calendar event
const tagANEvent = async (action_network_id, google_id) => {

	Logger.log("Tagging Action Network event " + action_network_id + " with Google Calendar event ID " + google_id)

	// Create a payload for the PUT request to Action Network, adding the Google ID as an identifier on the event
	const payload = JSON.stringify({ "identifiers": [ "google_id:" + google_id ] })

	// Set the options for the request and send it to Action Network, logging the response
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

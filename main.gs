// Get the u properties object for use throughout the script
const userProperties = PropertiesService.getUserProperties()
// Get the script properties object for use throughout the script
const scriptProperties = PropertiesService.getScriptProperties()
// Set standard API parameters for use in requests to the Action Network API
const standard_api_params = { headers: { "OSDI-API-Token": scriptProperties.getProperty("AN_API_KEY") }, contentType: "application/hal+json" }
// Set a default event length of 90 minutes in case no length is specified
const default_length_mins = 90
// Set the number of days to consider events as recently modified
const recently_modified = 7
// Set the number of days to consider events as upcoming
const days_upcoming = 28

// This function syncs events modified in the last week from Action Network to Google Calendar
const syncANtoGCal = () => {

	let events = getRecentlyModifiedEventIDs(recently_modified); // Get an array of event IDs for events modified in the last week
	Logger.log("Found " + events.length + " events modified in the last " + recently_modified + " days that have not started yet.");

	for (let i = 0; i < events.length; i++) {

		const event = getAllANEventData(events[i].href); // Get all event data for the current event ID

		const action_network_id = getEventIDFromAN(event, "action_network"); // Get the Action Network ID for the event

    Logger.log(event.title.trim() + " is listed as " + event.status + " in Action Network at " + action_network_id + ".");

    // If no Google ID is found for the event, we will assume it is not yet in Google Calendar.
		const google_id = getEventIDFromAN(event, "google_id");
    if (google_id === null) { // If the event is not in Google Calendar

			if (event.status != 'cancelled') { // If the event is not cancelled in Action Network, create it in Google Calendar
      
				createGoogleEvent(event, action_network_id);
        if (scriptProperties.getProperty("SLACK_WEBHOOK_URL") != null) { sendSlackMessage(event, 'New Event Added to the Calendar:') }

			}

		} else { // If the event is in Google Calendar

			// If the event was cancelled in Action Network, cancel it in Google Calendar
			if (event.status === 'cancelled') {

				cancelGoogleEvent(event, action_network_id, google_id);
        if (scriptProperties.getProperty("SLACK_WEBHOOK_URL") != null) { sendSlackMessage(event, 'Calendar Event Canceled:') }

			} else {

				updateGoogleEvent(event, action_network_id, google_id);

			}

		}

	}

}

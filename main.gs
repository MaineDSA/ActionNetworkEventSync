const scriptProperties = PropertiesService.getScriptProperties()
const standard_api_params = { headers: { "OSDI-API-Token": scriptProperties.getProperty("AN_API_KEY") }, contentType: "application/hal+json" }
const default_length_mins = 90
const recently_modified = 7

// Gets event IDs from Action Network for events modified in the last week.
const syncANtoGCal = () => {
  let events = getRecentlyModifiedEventIDs(recently_modified) // only events modified in last 7 days
  Logger.log("Found " + events.length + " events modified in the last " + recently_modified + " days.")

  for (let i = 0; i < events.length; i++) {
    const event = getAllANEventData(events[i].href)

    const action_network_id = getEventIDFromAN(event, "action_network" + ":[^,]*")

    // If no google_id is found for the event, assume it is not yet in Google Calendar.
    const google_id = getEventIDFromAN(event, "google_id" + ":[^,]*")

    if (google_id == null) {

      if (event.status != 'cancelled') {
        createGoogleEvent(event, action_network_id)
      }

    } else {

      // If event was canceled in Action Network, cancel it in Google
      if (event.status != 'cancelled') {
        updateGoogleEvent(event, action_network_id, google_id)
      } else {
		    cancelGoogleEvent(event, action_network_id, google_id)
      }

    }
  }
}

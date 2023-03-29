const createGoogleEvent = async (event, action_network_id) => {
  const eventName = event.title.trim()
  Logger.log("Creating event " + eventName + " from Action Network at " + action_network_id + ".")

  const eventDetails = {
    description: calDescription(event),
    location: formatLocation(event.location)
  }

  const calendarGoogle = CalendarApp.getCalendarById(scriptProperties.getProperty("GCAL_ID"))
  const eventGoogle = calendarGoogle.createEvent(eventName, getStartTime(event), getEndTime(event), eventDetails)
  const google_id = eventGoogle.getId()
  tagANEvent(action_network_id, google_id)
 
  Logger.log("Created event " + eventName + " in Google Calendar at " + google_id + ".")

  return eventGoogle.getId()
}

const updateGoogleEvent = async (event, action_network_id, google_id) => {
  const eventName = event.title.trim()
  Logger.log("Updating Google Calendar event " + eventName + " from Action Network at " + action_network_id + ".")

  const calendarGoogle = CalendarApp.getCalendarById(scriptProperties.getProperty("GCAL_ID"))
  let eventGoogle = calendarGoogle.getEventById(google_id)

  if (eventGoogle == null) {
    Logger.log("Google Calendar event " + google_id + " not found.")
    return
  }

  eventGoogle.setTitle(eventName)
  eventGoogle.setDescription(calDescription(event))
  eventGoogle.setTime(getStartTime(event), getEndTime(event))

  Logger.log("Updated event " + eventName + " in Google Calendar at " + google_id + ".")

  return eventGoogle.getId()
}

const cancelGoogleEvent = async (event, action_network_id, google_id) => {
  const eventName = event.title.trim()
  Logger.log(eventName + " is listed as cancelled in Action Network at " + action_network_id + ".")

  const eventGoogle = CalendarApp.getEventById(google_id)
  if (eventGoogle != null) {
    try {
			eventGoogle.deleteEvent()
      Logger.log(eventName + " has now been deleted from Google Calendar at " + google_id + ".")
      return true
		} catch(e) {
      Logger.log(eventName + " was already deleted from Google Calendar at " + google_id + ".")
      return false
    }
  }
}

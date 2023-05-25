// This function creates a Google Calendar event from an Action Network event
const createGoogleEvent = async (event, action_network_id) => {
  const eventName = event.title.trim(); // Get the event name and trim any leading or trailing whitespace
  Logger.log("Creating event " + eventName + " from Action Network at " + action_network_id + ".");

  // Set the event details object with the event description and location
  const eventDetails = {
    description: calDescription(event),
    location: formatLocation(event)
  }

  // Get the Google Calendar by ID from the script properties
  const calendarGoogle = CalendarApp.getCalendarById(scriptProperties.getProperty("GCAL_ID"));
  // Create the event in Google Calendar and get the Google ID for the new event
  const eventGoogle = calendarGoogle.createEvent(eventName, getStartTime(event), getEndTime(event), eventDetails);
  const google_id = eventGoogle.getId();
  // Tag the Action Network event with the Google ID for future reference
  tagANEvent(action_network_id, google_id);

  Logger.log("Created event " + eventName + " in Google Calendar at " + google_id + ".");

  return eventGoogle.getId(); // Return the Google ID for the new event
}

// This function updates a Google Calendar event with data from an updated Action Network event
const updateGoogleEvent = async (event, action_network_id, google_id) => {
  const eventName = event.title.trim(); // Get the event name and trim any leading or trailing whitespace
  Logger.log("Updating event " + eventName + " from Action Network at " + action_network_id + ".");

  // Get the Google Calendar by ID from the script properties
  const calendarGoogle = CalendarApp.getCalendarById(scriptProperties.getProperty("GCAL_ID"));
  // Get the existing Google Calendar event by ID
  let eventGoogle = calendarGoogle.getEventById(google_id);

  // If the Google Calendar event does not exist, log an error and return
  if (eventGoogle == null) {
    Logger.log("Google Calendar event " + google_id + " not found.");
    return;
  }

  // Update the Google Calendar event with the new event details
  eventGoogle.setTitle(eventName);
  eventGoogle.setDescription(calDescription(event));
  eventGoogle.setTime(getStartTime(event), getEndTime(event));

  Logger.log("Updated event " + eventName + " in Google Calendar at " + google_id + ".");

  return eventGoogle.getId(); // Return the Google ID for the updated event
}

// This function cancels a Google Calendar event that has been cancelled in Action Network
const cancelGoogleEvent = async (event, action_network_id, google_id) => {
  const eventName = event.title.trim(); // Get the event name and trim any leading or trailing whitespace
  Logger.log(eventName + " is listed as cancelled in Action Network at " + action_network_id + ".");

  // Get the Google Calendar event by ID
  const eventGoogle = CalendarApp.getEventById(google_id);
  // If the Google Calendar event exists, attempt to delete it
  if (eventGoogle != null) {
    try {
      eventGoogle.deleteEvent(); // Delete the event
      Logger.log(eventName + " has now been deleted from Google Calendar at " + google_id + ".");
      return true; // Return true to indicate that the event was successfully deleted
    } catch(e) {
      Logger.log(eventName + " was already deleted from Google Calendar at " + google_id + ".");
      return false; // Return false to indicate that the event was not deleted (since it was already deleted)
    }
  }
}

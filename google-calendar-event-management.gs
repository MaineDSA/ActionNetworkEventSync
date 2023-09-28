// This function creates a Google Calendar event from an Action Network event
const createGoogleEvent = async (event, action_network_id) => {
  const eventName = event.title.trim();
  Logger.log(`Creating event ${eventName} from Action Network at ${action_network_id}.`);

  const eventDetails = {
    description: calDescription(event),
    location: formatLocation(event)
  };

  const calendarGoogle = CalendarApp.getCalendarById(scriptProperties.getProperty("GCAL_ID"));
  const eventGoogle = calendarGoogle.createEvent(eventName, getStartTime(event), getEndTime(event), eventDetails);
  const google_id = eventGoogle.getId();
  Logger.log(`Created event ${eventName} in Google Calendar at ${google_id}.`);

  tagANEvent(action_network_id, google_id);
  Logger.log(`Tagged AN event ${eventName} with google_id ${google_id}.`);

  return google_id;
};

// This function updates a Google Calendar event with data from an updated Action Network event
const updateGoogleEvent = async (event, action_network_id, google_id) => {
  const eventName = event.title.trim();
  Logger.log(`Updating event ${eventName} from Action Network at ${action_network_id}.`);

  if (!scriptProperties.getProperty("GCAL_ID")) {
    Logger.log('No Google Calendar ID "GCAL_ID" provided, cannot continue.');
    return;
  }

  const calendarGoogle = CalendarApp.getCalendarById(scriptProperties.getProperty("GCAL_ID"));
  const eventGoogle = calendarGoogle.getEventById(google_id);

  if (!eventGoogle) {
    Logger.log(`Google Calendar event ${google_id} not found.`);
    return;
  }

  const event_description = calDescription(event);
  const start_time = getStartTime(event);
  const end_time = getEndTime(event);

  const title_old = eventGoogle.getTitle();
  if (title_old !== eventName) {
    eventGoogle.setTitle(eventName);
  }

  const desc_old = eventGoogle.getDescription();
  if (desc_old !== event_description) {
    eventGoogle.setDescription(event_description);
  }

  eventGoogle.setTime(start_time, end_time);

  Logger.log(`Updated event ${eventName} in Google Calendar at ${eventGoogle.getId()}.`);

  return eventGoogle.getId();
};

// This function cancels a Google Calendar event that has been cancelled in Action Network
const cancelGoogleEvent = async (event, action_network_id, google_id) => {
  const eventGoogle = CalendarApp.getEventById(google_id);

  if (!eventGoogle) {
    return;
  }

  const eventName = event.title.trim();

  try {
    eventGoogle.deleteEvent();
  } catch (e) {
    Logger.log(`${eventName} was already deleted from Google Calendar at ${google_id}.`);
    return false;
  }

  Logger.log(`${eventName} has now been deleted from Google Calendar at ${google_id}.`);
  return true;
};

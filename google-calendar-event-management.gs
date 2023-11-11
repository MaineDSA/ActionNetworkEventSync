// This function creates a Google Calendar event with data from an Action Network event
function createEvent(an_event, action_network_id) {
  const eventName = an_event.title.trim();
  Logger.log(`Creating event ${eventName} from Action Network at ${action_network_id}.`);

  const calendarId = 'primary';
  // event details for creating event.
  let event = {
    summary: eventName,
    //location: formatLocation(an_event.location),
    description: calDescription(an_event),
    start: {
      dateTime: getStartTime(an_event)
        .toISOString()
    },
    end: {
      dateTime: getEndTime(an_event)
        .toISOString()
    }
  };
  try {
    // call method to insert/create new event in provided calandar
    event = Calendar.Events.insert(event, calendarId);
    Logger.log(`Created event ${eventName} in Google Calendar at ${event.id}.`);

    tagANEvent(action_network_id, event.id);
    Logger.log(`Tagged AN event ${eventName} with google_id ${event.id}.`);

    return event.id;
  } catch (err) {
    console.log(`Creating Google event ${eventName} failed with error %s`, err.message);
  }
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
  const eventName = event.title.trim();

  try {
    Calendar.Events.delete('primary', google_id);
  } catch (e) {
    Logger.log(`${eventName} may have already been deleted from Google Calendar at ${google_id}.`);
    return false;
  }

  Logger.log(`${eventName} has now been deleted from Google Calendar at ${google_id}.`);
  return true;
};

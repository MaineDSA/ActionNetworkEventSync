/* eslint-disable no-unused-vars */
// This function creates a Google Calendar event with data from an Action Network event
function createEvent (actionNetworkEvent, actionNetworkEventID, apiKey) {
  const eventName = actionNetworkEvent.title.trim()
  console.info(`Creating event ${eventName} from Action Network at ${actionNetworkEventID}.`)

  if (!scriptProperties.getProperty('GCAL_ID')) {
    console.error('No Google Calendar ID "GCAL_ID" provided, cannot continue.')
    return
  }

  // event details for creating event.
  let googleEvent = {
    summary: eventName,
    location: formatLocation(actionNetworkEvent.location),
    description: calDescription(actionNetworkEvent),
    start: {
      dateTime: getStartTime(actionNetworkEvent).toISOString()
    },
    end: {
      dateTime: getEndTime(actionNetworkEvent).toISOString()
    }
  }
  try {
    // call method to insert/create new event in provided calandar
    googleEvent = Calendar.Events.insert(googleEvent, scriptProperties.getProperty('GCAL_ID'))
    console.info(`Created event ${eventName} in Google Calendar at ${googleEvent.id}.`)

    tagANEvent(actionNetworkEventID, googleEvent.id, apiKey)
    console.info(`Tagged AN event ${eventName} with google_id ${googleEvent.id} in calendar ${scriptProperties.getProperty('GCAL_ID')}.`)

    return googleEvent.id
  } catch (err) {
    console.error(`Creating Google event ${eventName} failed with error %s`, err.message)
  }
}

// This function updates a Google Calendar event with data from an updated Action Network event
function updateGoogleEvent (actionNetworkEvent, actionNetworkEventID, googleEventID) {
  if (!scriptProperties.getProperty('GCAL_ID')) {
    console.error('No Google Calendar ID "GCAL_ID" provided, cannot continue.')
    return
  }

  const eventGoogle = CalendarApp.getCalendarById(scriptProperties.getProperty('GCAL_ID')).getEventById(googleEventID)

  if (!eventGoogle) {
    console.info(`Google Calendar event ${googleEventID} not found.`)
    return
  }

  const eventName = actionNetworkEvent.title.trim()
  if (eventGoogle.getTitle() !== eventName) {
    console.info(`Updating title of event ${eventName} from Action Network at ${actionNetworkEventID}.`)
    eventGoogle.setTitle(eventName)
  }

  const eventLocation = formatLocation(actionNetworkEvent.location)
  if (eventGoogle.getLocation() !== eventLocation) {
    console.info(`Updating location of event ${eventName} from Action Network at ${actionNetworkEventID}.`)
    eventGoogle.setLocation(eventLocation)
  }

  const eventDescription = calDescription(actionNetworkEvent)
  if (eventGoogle.getDescription() !== eventDescription) {
    console.info(`Updating description of event ${eventName} from Action Network at ${actionNetworkEventID}.`)
    eventGoogle.setDescription(eventDescription)
  }

  const startTime = getStartTime(actionNetworkEvent)
  const endTime = getEndTime(actionNetworkEvent)
  eventGoogle.setTime(startTime, endTime)

  console.info(`Updated event ${eventName} in Google Calendar at ${eventGoogle.getId()}.`)

  return eventGoogle.getId()
}

// This function cancels a Google Calendar event
function cancelGoogleEvent (actionNetworkEvent, googleEventID) {
  if (!scriptProperties.getProperty('GCAL_ID')) {
    console.error('No Google Calendar ID "GCAL_ID" provided, cannot continue.')
    return
  }

  const eventName = actionNetworkEvent.title.trim()

  try {
    Calendar.Events.remove(scriptProperties.getProperty('GCAL_ID'), googleEventID)
    console.info(`${eventName} has now been deleted from Google Calendar at ${googleEventID}.`)
    return googleEventID
  } catch (e) {
    console.error(
      `Unable to delete ${eventName} from Google Calendar due to error ${e}. ${eventName} may have already been deleted from Google Calendar at ${googleEventID}.`
    )
    return false
  }
}

// This function removes the location data from a Google Calendar event based on an Action Network event
function removeGoogleEventLocation (actionNetworkEvent) {
  if (!scriptProperties.getProperty('GCAL_ID')) {
    console.error('No Google Calendar ID "GCAL_ID" provided, cannot continue.')
    return
  }

  actionNetworkEvent.location = {}
  actionNetworkEvent.location.venue = ''
  actionNetworkEvent.location.address_lines = ''
  actionNetworkEvent.location.locality = ''
  actionNetworkEvent.location.region = ''
  actionNetworkEvent.location.postal_code = ''

  const actionNetworkEventID = getEventIDFromAN(actionNetworkEvent, 'action_network')
  const googleEventID = getGoogleEventID(event)
  updateGoogleEvent(actionNetworkEvent, actionNetworkEventID, googleEventID)
}

/* eslint-disable no-unused-vars */
/* global formatLocation */
// This function creates a Google Calendar event with data from an Action Network event
function createEvent (actionNetworkEvent, actionNetwrkID, apiKey) {
  const eventName = actionNetworkEvent.title.trim()
  Logger.log(`Creating event ${eventName} from Action Network at ${actionNetwrkID}.`)

  if (!scriptProperties.getProperty('GCAL_ID')) {
    Logger.log('No Google Calendar ID "GCAL_ID" provided, cannot continue.')
    return
  }

  // event details for creating event.
  let event = {
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
    event = Calendar.Events.insert(event, scriptProperties.getProperty('GCAL_ID'))
    Logger.log(`Created event ${eventName} in Google Calendar at ${event.id}.`)

    tagANEvent(actionNetwrkID, event.id, apiKey)
    Logger.log(`Tagged AN event ${eventName} with google_id ${event.id}.`)

    return event.id
  } catch (err) {
    Logger.log(`Creating Google event ${eventName} failed with error %s`, err.message)
  }
}

// This function updates a Google Calendar event with data from an updated Action Network event
function updateGoogleEvent (event, actionNetworkID, googleID) {
  if (!scriptProperties.getProperty('GCAL_ID')) {
    Logger.log('No Google Calendar ID "GCAL_ID" provided, cannot continue.')
    return
  }

  const eventGoogle = CalendarApp.getCalendarById(scriptProperties.getProperty('GCAL_ID')).getEventById(googleID)

  if (!eventGoogle) {
    Logger.log(`Google Calendar event ${googleID} not found.`)
    return
  }

  const eventName = event.title.trim()
  if (eventGoogle.getTitle() !== eventName) {
    Logger.log(`Updating title of event ${eventName} from Action Network at ${actionNetworkID}.`)
    eventGoogle.setTitle(eventName)
  }

  const eventLocation = formatLocation(event.location)
  if (eventGoogle.getLocation() !== eventLocation) {
    Logger.log(`Updating location of event ${eventName} from Action Network at ${actionNetworkID}.`)
    eventGoogle.setLocation(eventLocation)
  }

  const eventDescription = calDescription(event)
  if (eventGoogle.getDescription() !== eventDescription) {
    Logger.log(`Updating description of event ${eventName} from Action Network at ${actionNetworkID}.`)
    eventGoogle.setDescription(eventDescription)
  }

  const startTime = getStartTime(event)
  const endTime = getEndTime(event)
  eventGoogle.setTime(startTime, endTime)

  Logger.log(`Updated event ${eventName} in Google Calendar at ${eventGoogle.getId()}.`)

  return eventGoogle.getId()
}

// This function cancels a Google Calendar event that has been cancelled in Action Network
function cancelGoogleEvent (event, googleID) {
  if (!scriptProperties.getProperty('GCAL_ID')) {
    Logger.log('No Google Calendar ID "GCAL_ID" provided, cannot continue.')
    return
  }

  const eventName = event.title.trim()

  try {
    Calendar.Events.remove(scriptProperties.getProperty('GCAL_ID'), googleID)
    Logger.log(`${eventName} has now been deleted from Google Calendar at ${googleID}.`)
    return googleID
  } catch (e) {
    Logger.log(`Unable to delete ${eventName} from Google Calendar due to error ${e}.`)
    Logger.log(`${eventName} may have already been deleted from Google Calendar at ${googleID}.`)
    return false
  }
}

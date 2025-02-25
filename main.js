/* eslint-disable no-unused-vars */
// Get the script properties object for use throughout the script
const scriptProperties = PropertiesService.getScriptProperties()

// Set standard API parameters for use in requests to the Action Network API
function standardApiParameters (apiKey) {
  return {
    headers: {
      'OSDI-API-Token': apiKey
    },
    contentType: 'application/hal+json'
  }
}

// Set constants for API URLs and default values
const apiUrlAn = 'https://actionnetwork.org/api/v2/'
const defultLengthMinutes = 90
const daysSinceModified = 28
const daysUpcomingEmail = 28
const daysUpcomingSlack = 1

const calendarGoogle = CalendarApp.getCalendarById(scriptProperties.getProperty('GCAL_ID'))

// This function syncs events modified in the last week from Action Network to Google Calendar
function syncANtoGCal () {
  if (!calendarGoogle) {
    Logger.log('No Google Calendar ID "GCAL_ID" provided, cannot continue.')
    return
  }

  const apiKeys = scriptProperties.getProperty('AN_API_KEY').split(',')
  for (const apiKey of apiKeys) {
    const eventIDs = getRecentlyModifiedEventIDs(daysSinceModified, apiKey)
    Logger.log(
      `Found ${eventIDs.length} events modified in the last ${daysSinceModified} days that have not started yet.`
    )

    for (const eventID of eventIDs) {
      const event = getAllANEventData(eventID.href, apiKey) // Get all event data for the current event ID

      const actionNetworkID = getEventIDFromAN(event, 'action_network') // Get the Action Network ID for the event
      Logger.log(
        `${event.title.trim()} is listed as ${event.status} in Action Network at ${actionNetworkID}.`
      )

      // If no Google ID is found for the event, we will assume it is not yet in Google Calendar.
      const googleID = getEventIDFromAN(event, 'google_id')
      if (!googleID) {
        // If the event is not in Google Calendar
        if (event.status !== 'cancelled') {
          // If the event is not cancelled in Action Network, create it in Google Calendar
          const googleIDNew = createEvent(event, actionNetworkID, apiKey)
          if (scriptProperties.getProperty('SLACK_WEBHOOK_URL')) {
            if (typeof googleIDNew === 'string') {
              const linkURL = event.browser_url
              const imageURL = event.featured_image_url ? event.featured_image_url : null
              sendSlackMessage(
                'New Event Added to the Calendar',
                formatSlackEventAnnouncement(event),
                linkURL,
                imageURL
              )
              Logger.log(`Sent Slack message for ID: ${googleIDNew}`)
            }
          }
        }
      } else {
        // If the event is in Google Calendar
        // If the event was cancelled in Action Network, cancel it in Google Calendar
        if (event.status === 'cancelled') {
          const googleIDNew = cancelGoogleEvent(event, actionNetworkID, googleID)
          if (typeof googleIDNew === 'string') {
            if (scriptProperties.getProperty('SLACK_WEBHOOK_URL')) {
              sendSlackMessage('Calendar Event Canceled', formatSlackEventAnnouncement(event), null, null)
              Logger.log(`Sent Slack message for ID: ${googleIDNew}`)
            }
          }
        } else {
          updateGoogleEvent(event, actionNetworkID, googleID)
        }
      }
    }
  }
}

// Calls the draftANMessage function with the output of the compileHTMLEmail() function as an argument.
function draftANEventMessage () {
  const dateFilter = getUpcomingEventLimitFilter(daysUpcomingEmail)
  const apiKeys = scriptProperties.getProperty('AN_API_KEY').split(',')
  const allEventIDs = []

  const eventApiKeyMap = new Map()
  for (const apiKey of apiKeys) {
    const eventIDs = getSortedANEventIDs(apiKey, dateFilter)
    eventIDs.forEach((eventID) => {
      eventApiKeyMap.set(eventID, apiKey)
    })
    allEventIDs.concat(eventIDs)
  }
  Logger.log(`EventApiKeyMap contains ${eventApiKeyMap.length} pairs`)

  Logger.log(`Sorting all ${allEventIDs.length} events from ${apiKeys.length} api keys by soonest`)
  const sortedEventIDs = allEventIDs.sort((a, b) =>
    sortIDByDate(a, b, eventApiKeyMap.get(a), eventApiKeyMap.get(b))
  )

  const emailHTML = compileHTMLEmail(sortedEventIDs, apiKeys[0])
  draftANMessage(emailHTML, apiKeys[0])
}

function postTodaysEvents () {
  // Check if the Slack Webhook URL is provided
  if (!scriptProperties.getProperty('SLACK_WEBHOOK_URL')) {
    Logger.log('No Slack Webhook URL "SLACK_WEBHOOK_URL" provided, cannot continue.')
    return
  }

  const apiKeys = scriptProperties.getProperty('AN_API_KEY').split(',')
  for (const apiKey of apiKeys) {
    const eventIDs = getSortedANEventIDs(apiKey, getUpcomingEventLimitFilter(daysUpcomingSlack))
    Logger.log(
      `Found ${eventIDs.length} events coming up in the next ${daysUpcomingSlack} ${daysUpcomingSlack === 1 ? 'day' : 'days'}.`
    )

    // Skip this AN group if there are no events today
    if (eventIDs.length === 0) {
      Logger.log('There are no events today. No message will be posted.')
      continue
    }

    for (const eventID of eventIDs) {
      const event = getAllANEventData(eventID.href, apiKey) // Get all event data for the current event ID
      Logger.log(`${event.title.trim()} is listed as ${event.status} in Action Network.`)

      if (event.status !== 'cancelled') {
        const linkURL = event.browser_url
        const imageURL = event.featured_image_url ? event.featured_image_url : null
        sendSlackMessage('Upcoming Event', formatSlackEventAnnouncement(event), linkURL, imageURL)
      }
    }
  }
}

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
    console.error('No Google Calendar ID "GCAL_ID" provided, cannot continue.')
    return
  }

  const apiKeys = scriptProperties.getProperty('AN_API_KEY').split(',')
  for (const apiKey of apiKeys) {
    const eventIDs = getRecentlyModifiedEventIDs(daysSinceModified, apiKey)
    const events = eventIDs.map(eventID => getAllANEventData(eventID.href, apiKey)).sort(sortEventByDate)
    console.info(
      `Found ${event.length} events modified in the last ${daysSinceModified} days that have not started yet.`
    )

    for (const event of events) {
      const actionNetworkID = getEventIDFromAN(event, 'action_network') // Get the Action Network ID for the event
      console.log(
        `${event.title.trim()} is listed as ${event.status} in Action Network at ${actionNetworkID} and starts on ${getStartTime(event)}.`
      )

      // If no Google ID is found for the event, we will assume it is not yet in Google Calendar.
      const googleID = getEventIDFromAN(event, 'google_id')
      if (!googleID && event.status !== 'cancelled') {
        // If the event is not in Google Calendar and the event is not cancelled in Action Network, create it in Google Calendar
        const googleIDNew = createEvent(event, actionNetworkID, apiKey)

        if (typeof googleIDNew !== 'string') {
          continue
        }

        if (scriptProperties.getProperty('SLACK_WEBHOOK_URL')) {
          sendMessage('SLACK_WEBHOOK_URL', event, 'New Event Added to the Calendar', sendSlackMessage)
        }
        if (scriptProperties.getProperty('DISCORD_WEBHOOK_URL')) {
          sendMessage('DISCORD_WEBHOOK_URL', event, 'New Event Added to the Calendar', sendDiscordMessage)
        }
      } else {
        if (event.status !== 'cancelled') {
          updateGoogleEvent(event, actionNetworkID, googleID)
          continue
        }

        // If the event is in Google Calendar and the event was cancelled in Action Network, cancel it in Google Calendar
        const googleIDNew = cancelGoogleEvent(event, googleID)
        if (typeof googleIDNew === 'string') {
          if (scriptProperties.getProperty('SLACK_WEBHOOK_URL')) {
            sendMessage('SLACK_WEBHOOK_URL', event, 'Calendar Event Canceled', sendSlackMessage)
          }
          if (scriptProperties.getProperty('DISCORD_WEBHOOK_URL')) {
            sendMessage('DISCORD_WEBHOOK_URL', event, 'Calendar Event Canceled', sendDiscordMessage)
          }
        }
      }
    }
  }
}

// Calls the draftANMessage function with the output of the compileHTMLEmail() function as an argument.
function draftANEventMessage () {
  const apiKeys = scriptProperties.getProperty('AN_API_KEY').split(',')
  const dateFilter = getUpcomingEventLimitFilter(daysUpcomingEmail)
  const eventApiKeyMap = getEventApiKeyMap(apiKeys, dateFilter)

  if (eventApiKeyMap.size === 0) {
    console.info('There are no upcoming events. No newsletter will be drafted.')
    return
  }

  const events = eventApiKeyMap.keys().toArray()
    .map(eventID => getAllANEventData(eventID.href, eventApiKeyMap.get(eventID)))
    .sort(sortEventByDate)

  console.info(`Creating newsletter at API key ending in ${apiKeys[0].slice(-4)}.`)
  const emailHTML = compileHTMLEmail(events)
  draftANMessage(emailHTML, apiKeys[0])
}

function postTodaysEvents () {
  // Check if the Slack Webhook URL is provided
  if (!scriptProperties.getProperty('SLACK_WEBHOOK_URL') && !scriptProperties.getProperty('DISCORD_WEBHOOK_URL')) {
    console.error('No Webhook URL "SLACK_WEBHOOK_URL" or "DISCORD_WEBHOOK_URL" provided, cannot continue.')
    return
  }

  const apiKeys = scriptProperties.getProperty('AN_API_KEY').split(',')
  const dateFilter = getUpcomingEventLimitFilter(daysUpcomingSlack)
  const eventApiKeyMap = getEventApiKeyMap(apiKeys, dateFilter)

  // Skip this AN group if there are no events today
  if (eventApiKeyMap.size === 0) {
    console.warn('There are no events today. No message will be posted.')
    return
  }

  const events = eventApiKeyMap.keys().toArray()
    .map(eventID => getAllANEventData(eventID.href, eventApiKeyMap.get(eventID)))
    .sort(sortEventByDate)

  for (const event of events) {
    console.log(`${event.title.trim()} is listed as ${event.status} in Action Network at ${getEventIDFromAN(event, 'action_network')} and starts on ${getStartTime(event)}.`)

    if (event.status === 'cancelled') {
      console.log(`Skipping cancelled event ${event.title.trim()}.`)
      continue
    }

    if (scriptProperties.getProperty('SLACK_WEBHOOK_URL')) {
      sendMessage('SLACK_WEBHOOK_URL', event, 'Upcoming Event', sendSlackMessage)
    }
    if (scriptProperties.getProperty('DISCORD_WEBHOOK_URL')) {
      sendMessage('DISCORD_WEBHOOK_URL', event, 'Upcoming Event', sendDiscordMessage)
    }
  }
}

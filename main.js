/* eslint-disable no-unused-vars */

/**
 * Get standard API parameters
 *
 * These will be used in requests to the Action Network API.
 *
 * @param {string} apiKey - The API key to use for authentication
 * @returns {dict} The standard API parameters of API key and content type.
 */
function standardApiParameters (apiKey) {
  return {
    headers: {
      'OSDI-API-Token': apiKey
    },
    contentType: 'application/hal+json'
  }
}

/**
 * Set constants for API URLs and default values
 */

const apiUrlAn = 'https://actionnetwork.org/api/v2/'
const defultLengthMinutes = 90
const daysSinceModified = 28
const daysUpcomingEmail = 28
const daysUpcomingSlack = 1

const scriptProperties = PropertiesService.getScriptProperties()
const calendarGoogle = CalendarApp.getCalendarById(scriptProperties.getProperty('GCAL_ID'))

/**
 * Sync an Action Network event to Google Calendar
 *
 * Also notifies Slack or Discord as configured
 *
 * @param {dict} event - The event to sync
 * @param {string} apiKey - The Action Network API key to use for authentication
 */
function syncANEventtoGCal (event, apiKey) {
  const actionNetworkID = getEventIDFromAN(event, 'action_network') // Get the Action Network ID for the event
  console.log(
    `${event.title.trim()} is listed as ${event.status} in Action Network at ${actionNetworkID} and starts on ${getStartTime(event)}.`
  )

  // If no Google ID is found for the event, we will assume it is not yet in Google Calendar.
  const googleID = getGoogleEventID(event)
  if (!googleID && event.status !== 'cancelled') {
    // If the event is not in Google Calendar and the event is not cancelled in Action Network, create it in Google Calendar
    const googleIDNew = createEvent(event, actionNetworkID, apiKey)

    if (typeof googleIDNew !== 'string') {
      return
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
      return
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

/**
 * Sync recently modified Action Network events to Google Calendar and remove location from all past events
 *
 * @param {string} apiKey - The Action Network API key to use for authentication
 */
function syncANGrouptoGCal (apiKey) {
  // Sync recently modified events
  const modifiedEvents = getRecentlyModifiedEvents(daysSinceModified, apiKey).sort(sortEventByDate)
  console.info(
    `Found ${modifiedEvents.length} events modified in the last ${daysSinceModified} days that have not started yet.`
  )

  for (const anEvent of modifiedEvents) { syncANEventtoGCal(anEvent, apiKey) }

  // Remove location from completed events
  const millisPerDay = 1000 * 60 * 60 * 24
  const now = new Date()
  const currentDate = Utilities.formatDate(now, 'UTC', 'yyyy-MM-dd')
  const daysAgoSecs = now.getTime() - millisPerDay * daysSinceModified
  const daysAgoDate = Utilities.formatDate(new Date(daysAgoSecs), 'UTC', 'yyyy-MM-dd')
  const pastFilter = `filter=end_date lt '${currentDate}' and start_date gt '${daysAgoDate}'`
  const pastEvents = getANEvents(pastFilter, apiKey)

  if (pastEvents.length === 0) {
    console.info('There are no recently finished events.')
    return
  }
  console.info(`Found ${pastEvents.length} past events.`)

  for (const anEvent of pastEvents) { removeGoogleEventLocation(anEvent) }
}

/**
 * Syncs events modified in the last week from Action Network to Google Calendar
 *
 * Loads Action Network API keys from the script properties and calls syncANGrouptoGCal for each key.
 */
function syncANtoGCal () {
  if (!calendarGoogle) {
    console.error('No Google Calendar ID "GCAL_ID" provided, cannot continue.')
    return
  }

  const apiKeys = scriptProperties.getProperty('AN_API_KEY').split(',')
  for (const apiKey of apiKeys) { syncANGrouptoGCal(apiKey) }
}

/**
 * Create a new Action Network newsletter draft based on upcoming events.
 *
 * Calls the draftANMessage function with the output of the compileHTMLEmail() function as an argument
 */
function draftANEventMessage () {
  const apiKeys = scriptProperties.getProperty('AN_API_KEY').split(',')
  const dateFilter = getUpcomingEventLimitFilter(daysUpcomingEmail)
  const events = apiKeys.flatMap(key => getFutureANEvents(key, dateFilter)).sort(sortEventByDate)

  if (events.length === 0) {
    console.info('There are no upcoming events. No newsletter will be drafted.')
    return
  }

  console.info(`Creating newsletter for group ${getANGroupName(apiKeys[0])}.`)

  const emailHTML = compileHTMLEmail(events)
  draftANMessage(emailHTML, apiKeys[0])
}

/**
 * Post an event message to Slack and/or Discord if the event has not been cancelled.
 */
function postEventMessage (event) {
  console.log(`${event.title.trim()} is listed as ${event.status} in Action Network at ${getEventIDFromAN(event, 'action_network')} and starts on ${getStartTime(event)}.`)

  if (event.status === 'cancelled') {
    console.log(`Skipping cancelled event ${event.title.trim()}.`)
    return
  }

  if (scriptProperties.getProperty('SLACK_WEBHOOK_URL')) {
    sendMessage('SLACK_WEBHOOK_URL', event, 'Upcoming Event', sendSlackMessage)
  }
  if (scriptProperties.getProperty('DISCORD_WEBHOOK_URL')) {
    sendMessage('DISCORD_WEBHOOK_URL', event, 'Upcoming Event', sendDiscordMessage)
  }
}

/**
 * Post today's events to Slack and/or Discord.
 */
function postTodaysEvents () {
  // Check if the Slack Webhook URL is provided
  if (!scriptProperties.getProperty('SLACK_WEBHOOK_URL') && !scriptProperties.getProperty('DISCORD_WEBHOOK_URL')) {
    console.error('No Webhook URL "SLACK_WEBHOOK_URL" or "DISCORD_WEBHOOK_URL" provided, cannot continue.')
    return
  }

  const apiKeys = scriptProperties.getProperty('AN_API_KEY').split(',')
  const dateFilter = getUpcomingEventLimitFilter(daysUpcomingSlack)
  const events = apiKeys.flatMap(key => getFutureANEvents(key, dateFilter)).sort(sortEventByDate)

  // Skip this AN group if there are no events today
  if (events.length === 0) {
    console.warn('There are no events today. No message will be posted.')
    return
  }

  for (const event of events) { postEventMessage(event) }
}

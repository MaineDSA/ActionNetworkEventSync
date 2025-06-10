/* eslint-disable no-unused-vars */
// This function gets the start time of an event, based on the event's location time zone.
function getStartTime (event) {
  const startDate = new Date(event.start_date)
  return new Date(`${startDate.toUTCString()} ${dstOffset(startDate)}`)
}

// This function gets the end time of an event, based on the event's location time zone.
function getEndTime (event) {
  const startDate = getStartTime(event)
  const endDate = new Date(event.end_date)
  const outputDate = new Date(endDate.toUTCString() + ' ' + dstOffset(endDate))
  if (isNaN(outputDate.getUTCFullYear())) {
    return new Date(startDate.getTime() + 60 * 1000 * defultLengthMinutes)
  }
  return outputDate
}

function sortEventByDate (eventFirst, eventSecond) {
  const startTimeFirst = getStartTime(eventFirst)
  const startTimeSecond = getStartTime(eventSecond)
  return startTimeFirst - startTimeSecond
}

// This function returns the requested event ID if it is found in the Action Network event data.
function getEventIDFromAN (contentJSON, searchID) {
  const identifiers = contentJSON.identifiers
  const fullSearchID = `${searchID}:[^,]*`

  const regexID = new RegExp(fullSearchID).exec(identifiers)
  if (!regexID) {
    console.warn(`${searchID} not found in Action Network event identifiers.`)
    return null
  }

  const foundID = regexID[0].substring(fullSearchID.indexOf('['))
  console.log(`${searchID} found in Action Network event identifiers: ${foundID}`)

  return foundID
}

// This function tags an Action Network event with the Google ID for its corresponding Google Calendar event
function tagANEvent (actionNetworkURL, googleID, apiKey) {
  // Check if the "AN_API_KEY" property is null
  if (!apiKey) {
    console.error('No Action Network API Key "AN_API_KEY" provided, cannot continue.')
    return
  }

  // Set the options for the request and send it to Action Network, logging the response
  const options = {
    method: 'put',
    payload: JSON.stringify({
      identifiers: [`google_id:${googleID}`]
    }),
    headers: {
      'Content-Type': 'application/json',
      'OSDI-API-Token': apiKey
    }
  }

  console.log(`Tagging Action Network event ${actionNetworkURL} with Google Calendar event ID ${googleID}`)
  UrlFetchApp.fetch(`${apiUrlAn}events/${actionNetworkURL}`, options)
}

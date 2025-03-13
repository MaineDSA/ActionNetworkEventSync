/* eslint-disable no-unused-vars */
// This function returns event IDs from Action Network. If a filter is provided, it appends it to the API URL.
function getANEventIDs (filter, apiKey) {
  let url = `${apiUrlAn}events/`
  if (filter) {
    console.log(`Finding upcoming events via filter query ${filter}.`)
    url += filter
  }
  const content = UrlFetchApp.fetch(url, standardApiParameters(apiKey))
  return JSON.parse(content)._links['osdi:events']
}

// This function sorts event IDs by date, based on the start time of the event.
// It is used by the getSortedANEventIDs function to sort the event IDs by the soonest event first.
function sortIDByDate (idFirst, idSecond, apiKeyFirst, apiKeySecond) {
  const startTimeFirst = getStartTime(getAllANEventData(idFirst.href, apiKeyFirst))
  const startTimeSecond = getStartTime(getAllANEventData(idSecond.href, apiKeySecond || apiKeyFirst))
  return startTimeFirst - startTimeSecond
}

// This function returns upcoming event IDs from Action Network, sorted by the soonest event first.
// If a filter is provided, it appends it to the API URL.
function getSortedANEventIDs (apiKey, extraFilters) {
  let filter = `?filter=start_date gt '${Utilities.formatDate(new Date(), 'UTC', 'yyyy-MM-dd')}'`

  if (extraFilters) {
    extraFilters.forEach((extrafilter) => {
      if (extrafilter) {
        filter += ` and ${extrafilter}`
      }
    })
  }

  const eventIDs = getANEventIDs(filter, apiKey)
  console.log(`Sorting ${eventIDs.length} events from API key ending in ${apiKey.slice(-4)} by soonest starting date`)

  return eventIDs.sort((idFirst, idSecond) => sortIDByDate(idFirst, idSecond, apiKey))
}

// This function returns event IDs from Action Network for events modified since a certain number of days ago that have not started yet.
// It calculates the date to filter events by based on the current date and the number of days ago.
// It uses the getSortedANEventIDs function to return the IDs sorted by soonest event first.
function getRecentlyModifiedEventIDs (DaysAgo, apiKey) {
  const MillisPerDay = 1000 * 60 * 60 * 24
  const now = new Date()
  const daysAgoDate = new Date(now.getTime() - MillisPerDay * DaysAgo)
  const extraFilters = [`modified_date gt '${Utilities.formatDate(daysAgoDate, 'UTC', 'yyyy-MM-dd')}'`]

  return getSortedANEventIDs(apiKey, extraFilters)
}

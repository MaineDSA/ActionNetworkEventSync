/* eslint-disable no-unused-vars */
// This function returns event IDs from Action Network. If a filter is provided, it appends it to the API URL.
function getANEventIDs (filter, apiKey) {
  let url = `${apiUrlAn}events/`
  if (filter) {
    console.log(`Finding upcoming events from API key ending in ${apiKey.slice(-4)} via filter query ${filter}.`)
    url += filter
  }
  const content = UrlFetchApp.fetch(url, standardApiParameters(apiKey))
  return JSON.parse(content)._links['osdi:events']
}

// This function returns upcoming event IDs from Action Network, sorted by the soonest event first.
// If a filter is provided, it appends it to the API URL.
function getFutureANEventIDs (apiKey, extraFilters) {
  const currentDate = Utilities.formatDate(new Date(), 'UTC', 'yyyy-MM-dd')
  let filter = `?filter=start_date gt '${currentDate}'`

  if (extraFilters) {
    extraFilters.forEach((extrafilter) => {
      if (extrafilter) {
        filter += ` and ${extrafilter}`
      }
    })
  }

  return getANEventIDs(filter, apiKey)
}

function getEventApiKeyMap (apiKeys, dateFilter) {
  const eventApiKeyMap = new Map()
  for (const apiKey of apiKeys) {
    const eventIDs = getFutureANEventIDs(apiKey, dateFilter)
    eventIDs.forEach((eventID) => {
      eventApiKeyMap.set(eventID, apiKey)
    })
  }
  return eventApiKeyMap
}

// This function returns event IDs from Action Network for events modified since a certain number of days ago that have not started yet.
// It calculates the date to filter events by based on the current date and the number of days ago.
// It uses the getSortedFutureANEventIDs function to return the IDs sorted by soonest event first.
function getRecentlyModifiedEventIDs (DaysAgo, apiKey) {
  const MillisPerDay = 1000 * 60 * 60 * 24
  const now = new Date()
  const daysAgoDate = new Date(now.getTime() - MillisPerDay * DaysAgo)
  const extraFilters = [`modified_date gt '${Utilities.formatDate(daysAgoDate, 'UTC', 'yyyy-MM-dd')}'`]

  return getFutureANEventIDs(apiKey, extraFilters)
}

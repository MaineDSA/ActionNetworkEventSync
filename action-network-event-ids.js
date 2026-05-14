/* eslint-disable no-unused-vars */

// Fetch the group (AEP) title for an API key, used for safe log identification
// in place of leaking part of the key. Falls back to a generic label if the
// AEP request fails or the title is missing.
function getANGroupName (apiKey) {
  try {
    const response = UrlFetchApp.fetch(apiUrlAn, standardApiParameters(apiKey))
    const title = JSON.parse(response).title
    if (title) {
      return title
    }
  } catch (err) {
    console.warn(`Could not fetch group name from Action Network AEP: ${err}`)
  }
  return '(unknown group)'
}

// This function returns events from Action Network. If a filter is provided, it appends it to the API URL.
function getANEvents (filter, apiKey) {
  let url = `${apiUrlAn}events/`
  if (filter) {
    console.log(`Finding upcoming events from group ${getANGroupName(apiKey)} via filter query ${filter}.`)
    url += filter
  }
  const content = UrlFetchApp.fetch(url, standardApiParameters(apiKey))
  return JSON.parse(content)._embedded['osdi:events']
}

// This function returns upcoming event IDs from Action Network, sorted by the soonest event first.
// If a filter is provided, it appends it to the API URL.
function getFutureANEvents (apiKey, extraFilters) {
  const currentDate = Utilities.formatDate(new Date(), 'UTC', 'yyyy-MM-dd')
  let filter = `?filter=start_date gt '${currentDate}'`

  if (extraFilters) {
    extraFilters.forEach((extrafilter) => {
      if (extrafilter) {
        filter += ` and ${extrafilter}`
      }
    })
  }

  return getANEvents(filter, apiKey)
}

// This function returns event IDs from Action Network for events modified since a certain number of days ago that have not started yet.
// It calculates the date to filter events by based on the current date and the number of days ago.
// It uses the getSortedFutureANEventIDs function to return the IDs sorted by soonest event first.
function getRecentlyModifiedEvents (DaysAgo, apiKey) {
  const MillisPerDay = 1000 * 60 * 60 * 24
  const now = new Date()
  const daysAgoDate = new Date(now.getTime() - MillisPerDay * DaysAgo)
  const extraFilters = [`modified_date gt '${Utilities.formatDate(daysAgoDate, 'UTC', 'yyyy-MM-dd')}'`]

  return getFutureANEvents(apiKey, extraFilters)
}

/* eslint-disable no-unused-vars */

// Fetch the sponsoring group's title for an API key, used for safe log
// identification in place of leaking part of the key. The API entry point does
// not expose a group name, so we read it from the `action_network:sponsor`
// block on the first event the key can see. Results are cached per key for
// the lifetime of the script run to avoid an extra request per log line.
const _anGroupNameCache = {}
function getANGroupName (apiKey) {
  if (_anGroupNameCache[apiKey]) {
    return _anGroupNameCache[apiKey]
  }
  let name = '(unknown group)'
  try {
    const response = UrlFetchApp.fetch(`${apiUrlAn}events/?per_page=1`, standardApiParameters(apiKey))
    const events = (JSON.parse(response)._embedded || {})['osdi:events'] || []
    for (const event of events) {
      const sponsor = event['action_network:sponsor']
      if (sponsor && sponsor.title) {
        name = sponsor.title
        break
      }
    }
  } catch (err) {
    console.warn(`Could not fetch group name from Action Network: ${err}`)
  }
  _anGroupNameCache[apiKey] = name
  return name
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
function getRecentlyModifiedEvents (daysAgo, apiKey) {
  const millisPerDay = 1000 * 60 * 60 * 24
  const now = new Date()
  const daysAgoDate = new Date(now.getTime() - millisPerDay * daysAgo)
  const extraFilters = [`modified_date gt '${Utilities.formatDate(daysAgoDate, 'UTC', 'yyyy-MM-dd')}'`]

  return getFutureANEvents(apiKey, extraFilters)
}

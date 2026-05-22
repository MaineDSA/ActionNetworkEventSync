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
    const events = getANEvents('per_page=1', apiKey)
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

// Retrieves a list of Action Network events based on a filter query, automatically handling multi-page pagination.
function getANEvents (filterQuery, apiKey) {
  let allEvents = []
  let url = `${apiUrlAn}events/`

  if (filterQuery) {
    console.log(`Finding upcoming events from group ${getANGroupName(apiKey)} via filter query ${filterQuery}.`)
    url += `?${filterQuery}`
  }

  const MAX_PAGES = 10
  let pageCount = 0
  while (url && pageCount < MAX_PAGES) {
    pageCount++
    try {
      const responseContent = UrlFetchApp.fetch(url, standardApiParameters(apiKey))
      const responseJson = JSON.parse(responseContent.getContentText())

      const pageEvents = responseJson._embedded?.['osdi:events'] || []
      allEvents = allEvents.concat(pageEvents)

      const nextLink = responseJson._links?.next?.href

      url = (nextLink && nextLink !== url) ? nextLink : null
      if (url) {
        console.log(`Fetching page ${pageCount + 1}...`)
      }
    } catch (e) {
      console.error(`API Page fetch failed on page ${pageCount} at endpoint ${url}: ${e}`)
      break
    }
  }

  if (pageCount >= MAX_PAGES) {
    console.warn(`Pagination reached the safety limit of ${MAX_PAGES} pages. Some events may not have been synced.`)
  }

  return allEvents
}

// This function returns upcoming event IDs from Action Network, sorted by the soonest event first.
// If a filter is provided, it appends it to the API URL.
function getFutureANEvents (apiKey, extraFilters) {
  const currentDate = Utilities.formatDate(new Date(), 'UTC', 'yyyy-MM-dd')
  let filter = `filter=start_date gt '${currentDate}'`

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

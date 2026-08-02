/* eslint-disable no-unused-vars */

// Retrieves a list of Action Network events based on a filter query, automatically handling multi-page pagination.
function getANEvents (query, apiKey, maxPages = 10) {
  let allEvents = []
  let url = `${apiUrlAn}events/`
  if (query) {
    url += `?${query}`
  }
  console.log(`Finding upcoming events via endpoint '${url}'.`)

  let pageCount = 0
  while (url && (pageCount < maxPages)) {
    pageCount++
    try {
      const responseContent = UrlFetchApp.fetch(url, standardApiParameters(apiKey))
      const responseJson = JSON.parse(responseContent.getContentText())

      const pageEvents = responseJson._embedded?.['osdi:events'] || []
      allEvents = allEvents.concat(pageEvents)

      const nextLink = responseJson._links?.next?.href

      url = (nextLink && nextLink !== url) ? nextLink : null
      if (url) {
        console.log(`Fetching page ${pageCount + 1} at ${url}...`)
      }
    } catch (e) {
      break
    }
  }

  if (pageCount >= maxPages) {
    console.warn(`Pagination reached the safety limit of ${maxPages} pages. Some event results may have been skipped.`)
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

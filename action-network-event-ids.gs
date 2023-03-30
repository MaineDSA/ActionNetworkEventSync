// This function returns event IDs from Action Network. If a filter is provided, it appends it to the API URL.
const getANEventIDs = (filter) => {
	let url = scriptProperties.getProperty("AN_API_URL") + "events/"
	if (filter != null) { url += filter }

	const content = UrlFetchApp.fetch(url, standard_api_params)
	return JSON.parse(content)["_links"]["osdi:events"]
}

// This function sorts event IDs by date, based on the start time of the event.
// It is used by the getSortedANEventIDs function to sort the event IDs by the soonest event first.
const sortByDate = (a,b) => {
	return getStartTime(getAllANEventData(a.href)) - getStartTime(getAllANEventData(b.href))
}

// This function returns upcoming event IDs from Action Network, sorted by the soonest event first.
// If a filter is provided, it appends it to the API URL.
const getSortedUpcomingANEventIDs = (extrafilters) => {
  const currentDate = new Date()
  const formattedFilterDate = Utilities.formatDate(currentDate, "UTC", "yyyy-MM-dd")
  let filter = "?filter=start_date gt '" + formattedFilterDate + "'"
  if (extrafilters != null) {
    for (let i = 0; i < extrafilters.length; i++) {
      if (extrafilters[i] != null) { filter += extrafilters[i] + "'" }
    }
  }
	Logger.log("Finding upcoming events via filter query " + filter + ".")

	const eventsByCreation = getANEventIDs(filter)
	Logger.log("Sorting " + eventsByCreation.length + " Events By Soonest")

	return eventsByCreation.sort(sortByDate)
}

// This function returns event IDs from Action Network for events modified since a certain number of days ago.
// It calculates the date to filter events by based on the current date and the number of days ago.
const getRecentlyModifiedEventIDs = (daysago) => {
	const MILLIS_PER_DAY = 1000 * 60 * 60 * 24
	const now = new Date()
	const lastWeek = new Date(now.getTime() - (MILLIS_PER_DAY * daysago))
	const filter_date = Utilities.formatDate(lastWeek, "UTC", "yyyy-MM-dd")

	return getANEventIDs("?filter=modified_date gt '" + filter_date + "'")
}

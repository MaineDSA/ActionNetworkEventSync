// Returns event IDs from Action Network
// If provided with filter, appends to api url
const getANEventIDs = (filter) => {
	let url = scriptProperties.getProperty("AN_API_URL") + "events/"
	if (filter != null) { url += filter }

	const content = UrlFetchApp.fetch(url, standard_api_params)
	return JSON.parse(content)["_links"]["osdi:events"]
}

// If provided with filter, appends to api url
const sortByDate = (a,b) => {
	return getStartTime(getAllANEventData(a.href)) - getStartTime(getAllANEventData(b.href))
}

// Returns upcoming event IDs from Action Network sorted by soonest event first
// If provided with filter, appends to api url
const getSortedANEventIDs = () => {
	const eventsByCreation = getANEventIDs("?filter=start_date gt '" + Utilities.formatDate(new Date(), "UTC", "yyyy-MM-dd") + "'")

	Logger.log("Sorting " + eventsByCreation.length + " Events By Soonest")
	return eventsByCreation.sort(sortByDate)
}

// Returns event IDs from Action Network for events modified since a number of days ago.
const getRecentlyModifiedEventIDs = (daysago) => {
	const MILLIS_PER_DAY = 1000 * 60 * 60 * 24
	const now = new Date()
	const lastWeek = new Date(now.getTime() - (MILLIS_PER_DAY * daysago))
	const filter_date = Utilities.formatDate(lastWeek, "UTC", "yyyy-MM-dd")

	return getANEventIDs("?filter=modified_date gt '" + filter_date + "'")
}

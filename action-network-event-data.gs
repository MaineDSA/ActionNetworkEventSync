// This function gets the start time of an event, based on the event's location time zone.
const getStartTime = (event) => {
	const start_date = new Date(event.start_date)
	const start_date_utc = start_date.toUTCString()
	const output_date = new Date(start_date_utc + ' ' + dstOffset(start_date))

	return output_date
}

// This function gets the end time of an event, based on the event's location time zone.
const getEndTime = (event) => {
	const start_date = getStartTime(event)

	const end_date = new Date(event.end_date)
	const end_date_utc = end_date.toUTCString()
	let output_date = new Date(end_date_utc + ' ' + dstOffset(end_date))

	// If output_date is not set, set to start_date + 90 minutes.
	if (isNaN(output_date)) { output_date = new Date(start_date.getTime() + (60 * 1000 * default_length_mins)) }

	return output_date
}

// This function returns the requested event ID if it is found in the Action Network event data.
const getEventIDFromAN = (contentJSON, search_id) => {
	const identifiers = contentJSON.identifiers
	const regex_id = new RegExp(search_id).exec(identifiers)

	if (regex_id === null) { return null }

	return regex_id[0].substring(search_id.indexOf('[')).trim()
}

// This function returns all event data for an event ID from Action Network.
// If provided with a filter_date ("UTC", "yyyy-MM-dd"), it returns only events modified since that date.
const getAllANEventData = (event_url) => {
	const content = UrlFetchApp.fetch(event_url, standard_api_params)
	return JSON.parse(content)
}

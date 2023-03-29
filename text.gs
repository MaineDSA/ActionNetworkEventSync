const formattedDescription = (description) => {
	let formatted = description.replace(new RegExp('<br><br>', 'g'), '<br>') // remove double line breaks
	formatted = formatted.replace(new RegExp('<br></p>', 'g'), '</p>') // remove trailing line breaks
	formatted = formatted.replace(new RegExp('  ', 'g'), ' ') // remove sequential spaces
	formatted = formatted.replace(new RegExp(' </p>', 'g'), '</p>') // remove trailing space at end of paragraph
	formatted = formatted.replace(new RegExp('<p>', 'g'), '<p>') // remove opening space at beginning of paragraph

	return formatted
}

const calDescription = (event) => {
	const moreInfo = "<p><b>More Info and RSVP:</b></p>" + '<p><a href="' + event.browser_url + '">' + event.browser_url + "</a>" + "</p>"
	const calDesc = "<p><b>Description:</b><br></p>" + formattedDescription(event.description)

	return moreInfo + calDesc
}

const formatLocation = (location) => {
	let locationString = ""
	try {
		locationString = location.venue + ', ' + location.address_lines.join() + ', ' + location.locality + ', ' + location.region + ' ' + location.postal_code
	} catch(e) {}

	return locationString
}

// Formats Event for Forecast
const formatEvent = (event) => {
	const title = event.title.trim()
	const start = getStartTime(event)
	const end_date = getEndTime(event)

	let formatted = '<div>'

	// date and title
	formatted += '<p style="margin: 0px"><span style="font-family:sans-serif;font-size:2em"><b>'
	formatted += start.toLocaleDateString("en-US", { weekday: "long" }) + " " + start.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" })
	formatted += " | "
	formatted += title + "</b></span></p>"

	// time and RSVP
	const startTime = start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
	const endTime = end_date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })

	formatted += '<p style="margin: 0px"><span style="font-family:monospace;font-size:1.25em"><em>' + startTime + " - " + endTime
	formatted += " | "
	formatted += '<a href="' + encodeURI(event.browser_url) + '">RSVP HERE</a></em></span></p>'

	// description
	formatted += '<p style="margin: 0px"><span style="font-family:sans-serif">' + formattedDescription(event.description) + "</span></p>"

	// add line break to end of entry
	formatted += "<br></div>"

	// set custom link colors
	formatted = formatted.replace(new RegExp('<a ', 'g'), '<a style="color: #' + scriptProperties.getProperty("LINK_COLOR") + '" ') 

	return formatted
}

const compileHTMLMessage = () => {
	Logger.log("Compiling HTML message of upcoming events.")

	let events = getSortedANEventIDs()
	Logger.log("Found " + events.length + " upcoming events.")

	let doc = ''
	for (let i = 0; i < events.length; i++) {
		const event = getAllANEventData(events[i].href)
		const eventBody = formatEvent(event)
		//Logger.log("EVENT: " + eventBody)
		doc += eventBody
	}

	return doc
}

// This function takes a string argument 'description' and formats it by replacing various HTML tags and whitespace characters
const formattedDescription = (description) => {
    // Remove double line breaks (<br><br>) and replace them with single line breaks (<br>)
	let formatted = description.replace(new RegExp('<br><br>', 'g'), '<br>');
    // Remove trailing line breaks (<br></p>) and replace them with closing paragraph tags (</p>)
	formatted = formatted.replace(new RegExp('<br></p>', 'g'), '</p>');
    // Remove sequential spaces and replace them with a single space character
	formatted = formatted.replace(new RegExp('  ', 'g'), ' ');
    // Remove trailing space at the end of a paragraph (</p>) and replace it with just the closing tag
	formatted = formatted.replace(new RegExp(' </p>', 'g'), '</p>');
    // Remove opening space at the beginning of a paragraph (<p>) and replace it with just the opening tag
	formatted = formatted.replace(new RegExp('<p>', 'g'), '<p>');

	return formatted; // Return the formatted string
}

// This function takes an event object as an argument and generates a formatted description string for the event
const calDescription = (event) => {
    // Create a string that provides a hyperlink to the event's browser URL and label it as "More Info and RSVP"
	const moreInfo = "<p><b>More Info and RSVP:</b></p>" + '<p><a href="' + event.browser_url + '">' + event.browser_url + "</a>" + "</p>";
    // Generate a string that describes the event with a "Description" label and a formatted description using the 'formattedDescription' function defined above
	const calDesc = "<p><b>Description:</b><br></p>" + formattedDescription(event.description);

	return moreInfo + calDesc; // Return the concatenated string
}

// This function takes a location object as an argument and generates a string with the venue, address, locality, region, and postal code
const formatLocation = (location) => {
	let locationString = ""; // Initialize an empty string to concatenate the location components into
	try {
        // Add the venue, address lines, locality, region, and postal code to the location string with commas in between
		locationString = location.venue + ', ' + location.address_lines.join() + ', ' + location.locality + ', ' + location.region + ' ' + location.postal_code;
	} catch(e) {} // If any of the location components are missing or null, simply return the empty string

	return locationString; // Return the location string
}

// This function takes an event object as an argument and returns a formatted string for use in a newsletter
const formatEvent = (event) => {
    // Trim the event title and get the start and end times for the event
	const title = event.title.trim();
	const start = getStartTime(event);
	const end_date = getEndTime(event);

	let formatted = '<div>'; // Start building the formatted string with a div tag

	// Add the event date and title with a larger font size and bold text
	formatted += '<p style="margin: 0px"><span style="font-family:sans-serif;font-size:2em"><b>';
	formatted += start.toLocaleDateString("en-US", { weekday: "long" }) + " " + start.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" });
	formatted += " | ";
	formatted += title + "</b></span></p>";

	// Add the event start and end times with a smaller font size and italic text, along with a hyperlink to RSVP for the event
	const startTime = start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
	const endTime = end_date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

	formatted += '<p style="margin: 0px"><span style="font-family:monospace;font-size:1.25em"><em>' + startTime + " - " + endTime;
	formatted += " | ";
	formatted += '<a href="' + encodeURI(event.browser_url) + '">RSVP HERE</a></em></span></p>';

	// Add the event description with a sans-serif font
	formatted += '<p style="margin: 0px"><span style="font-family:sans-serif">' + formattedDescription(event.description) + "</span></p>";

	// Add a line break to the end of the event entry and close the div tag
	formatted += "<br></div>";

	// Set custom link colors by replacing anchor tags with a style attribute containing a custom color value
	formatted = formatted.replace(new RegExp('<a ', 'g'), '<a style="color: #' + scriptProperties.getProperty("LINK_COLOR") + '" ') 

	return formatted; // Return the final formatted string for the event
}

// This function compiles an HTML message of upcoming events and returns it as a string
const compileHTMLMessage = () => {
	Logger.log("Compiling HTML message of upcoming events.");

	let events = getSortedANEventIDs(); // Get an array of sorted event IDs
	Logger.log("Found " + events.length + " upcoming events.");

	let doc = ''; // Initialize an empty string for the final compiled HTML message
	for (let i = 0; i < events.length; i++) {
		const event = getAllANEventData(events[i].href); // Get all event data for the current event ID
		const eventBody = formatEvent(event); // Format the current event as a string for use in the newsletter
		//Logger.log("EVENT: " + eventBody);
		doc += eventBody; // Add the formatted event string to the final HTML message
	}

	return doc; // Return the final compiled HTML message
}

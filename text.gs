// This function takes a string argument 'description' and formats it by replacing various HTML tags and whitespace characters
const formattedDescription = (description) => {
  // Remove double line breaks (<br><br>) and replace them with single line breaks (<br>)
  let formatted = description.replace(new RegExp('<br><br>', 'g'), '<br>')
  // Remove trailing line breaks (<br></p>) and replace them with closing paragraph tags (</p>)
  formatted = formatted.replace(new RegExp('<br></p>', 'g'), '</p>')
  // Remove sequential spaces and replace them with a single space character
  formatted = formatted.replace(new RegExp('  ', 'g'), ' ')
  // Remove trailing space at the end of a paragraph (</p>) and replace it with just the closing tag
  formatted = formatted.replace(new RegExp(' </p>', 'g'), '</p>')
  // Remove opening space at the beginning of a paragraph (<p>) and replace it with just the opening tag
  formatted = formatted.replace(new RegExp('<p>', 'g'), '<p>')

  return formatted // Return the formatted string
}

// This function takes an event object as an argument and generates a formatted description string for the event
const calDescription = (event) => {
  // Create a string that provides a hyperlink to the event's browser URL and label it as "More Info and RSVP"
  const moreInfo = "<p><b>More Info and RSVP:</b></p>" + '<p><a href="' + event.browser_url + '">' + event.browser_url + "</a>" + "</p>"
  // Generate a string that describes the event with a "Description" label and a formatted description using the 'formattedDescription' function defined above
  const calDesc = "<p><b>Description:</b><br></p>" + formattedDescription(event.description)

  return moreInfo + calDesc // Return the concatenated string
}

// This function takes a location object as an argument and generates a string with the venue, address, locality, region, and postal code
const formatLocation = (location) => {
  let locationString = "" // Initialize an empty string to concatenate the location components into
  try {
    // Add the venue, address lines, locality, region, and postal code to the location string with commas in between
    locationString = location.venue + ', ' + location.address_lines.join() + ', ' + location.locality + ', ' + location.region + ' ' + location.postal_code
  } catch(e) {} // If any of the location components are missing or null, simply return the empty string

  return locationString // Return the location string
}

// This function takes an event object as an argument and returns a formatted string for use in a newsletter
const formatEvent = (event) => {
  // Trim the event title and get the start and end times for the event
  const title = event.title.trim();
  const start = getStartTime(event);
  const end_date = getEndTime(event);

  // Define the event title template and format it with the event date and title
  const template_title =
    '<p style="margin: 0px"><span style="font-family:sans-serif;font-size:2em"><b>%EVENTDATETIME% | %EVENTTITLE%</b></span></p>';
  const event_date_weekday = start.toLocaleDateString("en-US", { weekday: "long" });
  const event_date_monthday = start.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" });
  const formatted_title = template_title
    .replace("%EVENTDATETIME%", event_date_weekday + " " + event_date_monthday)
    .replace("%EVENTTITLE%", event.title.trim());

  // Define the event time and link template and format it with the event duration and URL
  const template_time_and_link =
    '<p style="margin: 0px"><span style="font-family:monospace;font-size:1.25em"><em>%EVENTDURATION% | <a href="%EVENTURL%">RSVP HERE</a></em></span></p>';
  const startTime = start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const endTime = end_date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const eventURL = encodeURI(event.browser_url);
  const formatted_date_and_link = template_time_and_link
    .replace("%EVENTDURATION%", startTime + " - " + endTime)
    .replace("%EVENTURL%", eventURL);

  // Define the event description template and format it with the event description
  const template_description =
    '<p style="margin: 0px"><span style="font-family:sans-serif">%EVENTDESCRIPTION%</span></p>';
  const formatted_description = template_description.replace(
    "%EVENTDESCRIPTION%",
    formattedDescription(event.description)
  );

  // Combine the formatted title, date, link, and description
  let formatted_body = "<div>" + formatted_title + formatted_date_and_link + formatted_description + "<br></div>";

  // Set custom link colors by replacing anchor tags with a style attribute containing a custom color value
  formatted_body = formatted_body.replace(
    new RegExp("<a ", "g"),
    '<a style="color: #' + scriptProperties.getProperty("LINK_COLOR") + '" '
  );

  return formatted_body; // Return the final formatted string for the event
};

// This function compiles an HTML message of upcoming events and returns it as a string
const compileHTMLMessage = () => {
  Logger.log("Compiling HTML message of upcoming events.")

  const filterDate = new Date()
  filterDate.setDate(filterDate.getDate() + days_upcoming)
  const formattedFilterDate = Utilities.formatDate(filterDate, "UTC", "yyyy-MM-dd")
  const events = getSortedUpcomingANEventIDs(" and start_date lt '" + formattedFilterDate) // Get an array of sorted event IDs

  Logger.log("Found and sorted " + events.length + " upcoming events.")

  let doc = '' // Initialize an empty string for the final compiled HTML message
  for (let i = 0; i < events.length; i++) {
    const event = getAllANEventData(events[i].href) // Get all event data for the current event ID
    const eventBody = formatEvent(event) // Format the current event as a string for use in the newsletter
    Logger.log("EVENT: " + eventBody)
    doc += eventBody // Add the formatted event string to the final HTML message
  }

  return doc // Return the final compiled HTML message
}

const formattedDescriptionFooter = (description) => {

  let mask = ''

  if (description.toLocaleLowerCase().includes('no mask policy') === false) {
    mask += '<h5><strong>Mask Policy:</strong></h5>'
    mask += '<p>If this event is in-person and you would like this to be a masked event, please contact the event organizer at least 3 days ahead of time.</p>'
    mask += '<p>Contact information for the event organizer should be listed at the RSVP link found above.</p>'
    mask += '<p>For complete details about this policy, <a style="color:#'+ scriptProperties.getProperty("LINK_COLOR") +';text-decoration:none" href="https://mainedsa.org/covid">click here</a>.</p>'
  }

  return mask

}

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
  const moreInfo = "<h5><strong>More Info and RSVP:</strong></h5>" + '<p><a style="color:#'+ scriptProperties.getProperty("LINK_COLOR") +';text-decoration:none" href="' + event.browser_url + '">' + event.browser_url + "</a>" + "</p>"
  // Generate a string that describes the event with a "Description" label and a formatted description using the 'formattedDescription' function defined above
  const calDesc = "<h5><strong>Description:</strong></h5>" + formattedDescription(event.description)
  // Create a string that provides a hyperlink to the chapter's COVID policy URL and label it as "Mask Policy"
  const calDescFooter = formattedDescriptionFooter(event.description)

  return moreInfo + calDesc + calDescFooter // Return the concatenated string
  
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
  const start = getStartTime(event);
  const end_date = getEndTime(event);

  // Define the event title template and format it with the event date and title
  const template_title =
    '<h2 style="font-size:1.8em;margin-bottom:-.9rem">%EVENTTITLE%</h2>';
  const formatted_title = template_title.replace("%EVENTTITLE%", event.title.trim());

  // Define the event time and link template and format it with the event duration and URL
  const template_time_and_link =
    '<h3 style="font-style:italic;margin-bottom:-.5rem">%EVENTDATE% | %EVENTDURATION% | <a style="color:#'+ scriptProperties.getProperty("LINK_COLOR") +';text-decoration:none" href="%EVENTURL%">RSVP HERE</a></h3>';
  const event_date_weekday = start.toLocaleDateString("en-US", { weekday: "long" });
  const event_date_monthday = start.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" });
  const startTime = start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const endTime = end_date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const eventURL = encodeURI(event.browser_url);
  const formatted_date_and_link = template_time_and_link
    .replace("%EVENTDATE%", event_date_weekday + " " + event_date_monthday)
    .replace("%EVENTDURATION%", startTime + " - " + endTime)
    .replace("%EVENTURL%", eventURL);

  // Combine the formatted title, date, link, and description
  let formatted_body = '<article style="flex-basis:calc(100% - 4rem)">' + formatted_title + formatted_date_and_link + event.description + "</article>";

  // Set custom link colors by replacing anchor tags with a style attribute containing a custom color value
  formatted_body = formatted_body.replace(
    new RegExp("<a ", "g"),
    '<a style="color: #' + scriptProperties.getProperty("LINK_COLOR") + '" '
  );

  // Set line spacing for unformatted paragraphs
  formatted_body = formatted_body.replace(
    new RegExp("<p>", "g"),
    '<p style="margin-bottom:-.5rem">'
  );

  return formatted_body; // Return the final formatted string for the event
  
};

const getUpcomingEventDateFilter = () => {

  const futureDate = new Date()
  futureDate.setDate(futureDate.getDate() + days_upcoming)
  const queryFutureDate = " and start_date lt '" + Utilities.formatDate(futureDate, "UTC", "yyyy-MM-dd") + "'"

  return [ queryFutureDate ]

}

// This function compiles an HTML message of upcoming events and returns it as a string
const compileHTMLMessage = () => {

  Logger.log("Compiling HTML message of upcoming events.")

  const events = getSortedUpcomingANEventIDs(getUpcomingEventDateFilter()) // Get an array of sorted event IDs

  Logger.log("Found and sorted " + events.length + " upcoming events.")

  let doc = '' // Initialize blank string for the final compiled HTML message

  // Priority Announcement
  doc += '<br /><hr class="rounded">'
  doc += '<h1><center>Priority Announcement</center></h1>'
  doc += '<br /><p>Description of priority announcement.</p>'

  // Upcoming Events
  doc += '<br /><hr class="rounded"><h1><center>Upcoming Events</center></h1>'
  doc += '<p><center><a style="color:#'+ scriptProperties.getProperty("LINK_COLOR") +';text-decoration:none" href="' + scriptProperties.getProperty("GCAL_LINK") + '">Google Calendar Link</a></center></p>'
  doc += '<p><center><a style="color:#'+ scriptProperties.getProperty("LINK_COLOR") +';text-decoration:none" href="' + 'https://mainedsa.org/covid' + '">Mask Policy Link</a></center></p>'
  doc += '<section">'
  for (let i = 0; i < events.length; i++) {

    const event = getAllANEventData(events[i].href) // Get all event data for the current event ID
    const eventBody = formatEvent(event) // Format the current event as a string for use in the newsletter
    Logger.log("EVENT: " + eventBody + '; STATUS: ' + event.status)

    if (event.status != 'cancelled') { doc += eventBody } // Add the formatted event string to the final HTML message if not cancelled

  }
  doc += '</section>'

  // Additional Announcement(s)
  doc += '<br /><hr class="rounded"><h1><center>Even More</center></h1>'
  doc += '<section style="display:flex;flex-direction:row;flex-wrap:wrap">'
  doc += '<article style="padding:0 .8em;flex-basis:calc((100% - 4rem)/2)"><h2>First title</h2><p>Description of first announcement.</p></article>' // add first announcement
  doc += '<article style="padding:0 .8em;flex-basis:calc((100% - 4rem)/2)"><h2>Second title</h2><p>Description of second announcement.</p></article>' // add second announcement
  doc += '</section>'

  return doc // Return the final compiled HTML message

}

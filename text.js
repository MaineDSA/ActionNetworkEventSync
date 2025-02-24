// This function takes a string argument 'description' and formats it by replacing various HTML tags and whitespace characters
function formattedDescription (description) {
  return description
    .replace(/<br><br>/g, '<br>')
    .replace(/<br><\/p>/g, '</p>')
    .replace(/^<p> /g, '<p>')
    .replace(/ <\/p>/g, '</p>')
    .replace(/ {2}/g, ' ')
}

// This function takes an event object as an argument and generates a formatted description string for the event
const calDescription = (event) => {
  const moreInfo = `<h5><strong>More Info and RSVP:</strong></h5><p><a href="${event.browser_url}">${event.browser_url}</a></p>`;
  const calDesc = `<h5><strong>Description:</strong></h5>${formattedDescription(event.description)}`;
  let calDescFooter = "";
  if (typeof formattedDescriptionFooter === "function") {
    calDescFooter = formattedDescriptionFooter(event.description);
  }
  return moreInfo + calDesc + calDescFooter;
};

// This function takes a location object as an argument and generates a string with the venue, address, locality, region, and postal code
const formatLocation = (location) => {
  const {venue, address_lines, locality, region, postal_code} = location;
  return `${venue}, ${address_lines.join()}, ${locality}, ${region} ${postal_code}`;
};

// This function takes an event object as an argument and returns a formatted string for use in a newsletter
const formatEvent = (event) => {
  const start = getStartTime(event);
  const end_date = getEndTime(event);

  const template_title = `<h2>${event.title.trim()}</h2>`;
  const event_date = start.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "2-digit",
  });
  const startTime = start.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  const endTime = end_date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  const template_time_and_link = `<h3>${event_date} | ${startTime} - ${endTime}</h3>`;
  const image_url = event.featured_image_url
    ? `<a href="${encodeURI(event.browser_url)}" target="_blank"><img src="${encodeURI(event.featured_image_url)}" alt="Event Promo Image"></a>`
    : "";
  const button_rsvp = `<a href="${encodeURI(event.browser_url)}" target="_blank"><button type="button">Sign Me Up</button></a>`;

  const formatted_body = `<article class="event_article">${template_title}${template_time_and_link}${image_url}${button_rsvp}${event.description}</article>`;

  return formatted_body
    .replace(/<a /g, `<a `)
};

const getUpcomingEventLimitFilter = (nextdays) => {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + nextdays);
  const queryFutureDate = `start_date lt '${Utilities.formatDate(futureDate, "UTC", "yyyy-MM-dd")}'`;
  return [queryFutureDate];
};

const getHTMLTopAnnouncement = () => {
  return `<br /><hr class="rounded"><h1>Priority Announcement</h1><br /><p>Description of priority announcement.</p>`;
};

const getEventDescBody = (event, api_key) => {
  const eventData = getAllANEventData(event.href, api_key);
  return eventData.status !== "cancelled" ? formatEvent(eventData) : "";
};

const getHTMLEvents = (events, api_key) => {
  let doc = `<br /><hr class="rounded"><h1>Upcoming Events</h1>`;
  if (typeof formattedCalendarText === "function") {
    doc += formattedCalendarText(events);
  }
  const eventBodies = events.map((event) => getEventDescBody(event, api_key));
  doc += `<section>${eventBodies.join("")}</section>`;
  return doc;
};

const getHTMLAnnouncements = () => {
  return `
  <br />
  <hr class="rounded">
  <h1>Even More</h1>
  <section class="announce_section">
  <article class="announce_article"><h2>First title</h2><p>Description of first announcement.</p></article>
  <article class="announce_article"><h2>Second title</h2><p>Description of second announcement.</p></article>
  </section>
  `;
};

// This function compiles an HTML message of upcoming events and returns it as a string
const compileHTMLEmail = (event_ids, api_key) => {
  return getHTMLTopAnnouncement() + getHTMLEvents(event_ids, api_key) + getHTMLAnnouncements();
};

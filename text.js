/* eslint-disable no-unused-vars */
// This function takes a string argument 'description' and formats it by replacing various HTML tags and whitespace characters
function formatDescription (description) {
  return description
    .replace(/<br><br>/g, '<br>')
    .replace(/<br><\/p>/g, '</p>')
    .replace(/^<p> /g, '<p>')
    .replace(/ <\/p>/g, '</p>')
    .replace(/<p>\s*<\/p>/g, '')
    .replace(/ {2}/g, ' ')
}

// This function takes an event object as an argument and generates a formatted description string for the event
function calDescription (event) {
  const moreInfo = `
    <h5><strong>More Info and RSVP:</strong></h5>
    <a href="${event.browser_url}">
      <p>${event.browser_url}</p>
    </a>
    `
  const calDesc = `
    <h5><strong>Description:</strong></h5>
    ${formatDescription(event.description)}
    `
  let calDescFooter = ''
  if (typeof customEventDescriptionFooter === 'function') {
    calDescFooter = customEventDescriptionFooter(event.description)
  }
  return moreInfo + calDesc + calDescFooter
}

// This function takes a location object as an argument and generates a string with the venue, address, locality, region, and postal code
const formatLocation = (location) => {
  if (location.postal_code === '') {
    return ''
  }
  const { venue, address_lines: addressLines, locality, region, postal_code: zipCode } = location
  return `${venue}, ${addressLines.join()}, ${locality}, ${region} ${zipCode}`
}

// This function takes an event object as an argument and returns a formatted string for use in a newsletter
function formatEvent (event) {
  const startDate = getStartTime(event)
  const endDate = getEndTime(event)

  const templateTitle = `<h2>${event.title.trim()}</h2>`
  const eventDate = startDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: '2-digit'
  })
  const startTime = startDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  })
  const endTime = endDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  })
  const templateTimeAndLink = `<h3><time datetime=${startDate.toISOString()}>${eventDate}</time> | ${startTime} - ${endTime}</h3>`
  const imageURL = event.featured_image_url
    ? `
      <a href="${encodeURI(event.browser_url)}" target="_blank">
        <img src="${encodeURI(event.featured_image_url)}" alt="Event Promo Image">
      </a>
    `
    : ''
  const buttonRSVP = `
    <a href="${encodeURI(event.browser_url)}" target="_blank">
      <button type="button">Sign Me Up</button>
    </a>
  `

   return `
    <article class="event_article">
      ${templateTitle}
      ${templateTimeAndLink}
      ${imageURL}
      ${buttonRSVP}
      ${event.description}
    </article>
    `
}

function getUpcomingEventLimitFilter (nextdays) {
  const futureDate = new Date()
  futureDate.setDate(futureDate.getDate() + nextdays)
  const queryFutureDate = `start_date lt '${Utilities.formatDate(futureDate, 'UTC', 'yyyy-MM-dd')}'`
  return [queryFutureDate]
}

function getHTMLTopAnnouncement () {
  return `
    <br />
    <hr class="rounded">
    <h1 id="announcement">Priority Announcement</h1>
    <br />
    <p>Description of priority announcement.</p>
    `
}

function getEventDescBody (event, apiKey) {
  const eventData = getAllANEventData(event.href, apiKey)
  return eventData.status !== 'cancelled' ? formatEvent(eventData) : ''
}

function getHTMLEvents (events, eventApiKeyMap) {
  let doc = `
    <br />
    <hr class="rounded">
    <h1 id="upcoming">Upcoming Events</h1>
    `
  if (typeof customNewsletterEventHeaderText === 'function') {
    doc += customNewsletterEventHeaderText(events)
  }
  const eventBodies = events.map((event) => getEventDescBody(event, eventApiKeyMap.get(event)))
  doc += `
    <section>
      ${eventBodies.join('')}
    </section>
  `
  return doc
}

function getHTMLAnnouncements () {
  let doc = ''
  if (typeof customAnnouncements === 'function') {
    doc += customAnnouncements()
  }
  return doc
}

// Compile an HTML message of upcoming events and return it as a string
function compileHTMLEmail (eventIDs, eventApiKeyMap) {
  return getHTMLTopAnnouncement() + getHTMLEvents(eventIDs, eventApiKeyMap) + getHTMLAnnouncements()
}

// Consolidate event title and start time into a multi-line formatted string
function formatEventAnnouncementMessage (event) {
  const startstring = getStartTime(event).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: '2-digit',
    hour: 'numeric',
    minute: '2-digit'
  })
  return `*${event.title.trim()}*\n${startstring}`
}

// This function takes a string argument 'description' and formats it by replacing various HTML tags and whitespace characters
const formattedDescription = (description) => {
  return description
    .trim()
    .replace(/<br><br>|<br><\/p>|  | <\/p>|<p>/g, (match) => {
      switch (match) {
      case '<br><br>':
        return '<br>';
      case '<br></p>':
        return '</p>';
      case '  ':
        return ' ';
      case ' </p>':
        return '</p>';
      case '<p>':
        return '<p>';
      }
    });
};

// This function takes an event object as an argument and generates a formatted description string for the event
const calDescription = (event) => {
  const moreInfo =
    `<h5><strong>More Info and RSVP:</strong></h5><p><a style="color:#${scriptProperties.getProperty("LINK_COLOR")};text-decoration:none" href="${event.browser_url}">${event.browser_url}</a></p>`;
  const calDesc = `<h5><strong>Description:</strong></h5>${formattedDescription(event.description)}`;
  let calDescFooter = '';
  if (typeof formattedDescriptionFooter === 'function') {
    calDescFooter = formattedDescriptionFooter(event.description);
  }
  return moreInfo + calDesc + calDescFooter;
};

// This function takes a location object as an argument and generates a string with the venue, address, locality, region, and postal code
const formatLocation = (location) => {
  const {
    venue,
    address_lines,
    locality,
    region,
    postal_code
  } = location;
  return `${venue}, ${address_lines.join()}, ${locality}, ${region} ${postal_code}`;
};

// This function takes an event object as an argument and returns a formatted string for use in a newsletter
const formatEvent = (event) => {
  const start = getStartTime(event);
  const end_date = getEndTime(event);

  const template_title =
    `<h2 style="font-size:1.8em; margin-top: 0.002em; margin-bottom:-.9rem">${event.title.trim()}</h2>`;
  const event_date = start.toLocaleDateString("en-US", {
    weekday: "long",
    month: 'long',
    day: "2-digit"
  });
  const startTime = start.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit"
  });
  const endTime = end_date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit"
  });
  const template_time_and_link =
    `<h3 style="font-style:italic;margin-bottom:-.5rem">${event_date} | ${startTime} - ${endTime}</h3>`;
  const image_url = event.featured_image_url ?
    `<a href="${encodeURI(event.browser_url)}" target="_blank"><img style="height: 100%; width: 100%; object-fit: contain; margin-top: 20px" src="${encodeURI(event.featured_image_url)}" alt="Promo Image"></a>` :
    '';
  const button_rsvp =
    `<a href="${encodeURI(event.browser_url)}" target="_blank"><button type="button" style="background-color: #${scriptProperties.getProperty("LINK_COLOR")}; border: 0.5px solid ${scriptProperties.getProperty("LINK_COLOR")}; border-radius: 10px; color: #fff; padding: 8px; margin-top: 18px">Sign Me Up</button></a>`;

  let formatted_body =
    `<article style="outline: #${scriptProperties.getProperty("LINK_COLOR")} dotted 2.5px; padding: 1em; margin-top: 1.5em; padding-bottom: 1.5em">${template_title}${template_time_and_link}${image_url}${button_rsvp}${event.description}</article>`;
  formatted_body = formatted_body.replace(/<a /g, `<a style="color: #${scriptProperties.getProperty("LINK_COLOR")}" `)
    .replace(/<p>/g, '<p style="margin-bottom:-.5rem">');

  return formatted_body;
};

const getUpcomingEventDateFilter = (nextdays) => {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + nextdays);
  const queryFutureDate = ` and start_date lt '${Utilities.formatDate(futureDate, "UTC", "yyyy-MM-dd")}'`;
  return [queryFutureDate];
};

const getHTMLTopAnnouncement = () => {
  return `<br /><hr class="rounded"><h1><center>Priority Announcement</center></h1><br /><p>Description of priority announcement.</p>`;
};

const getHTMLEvents = (events) => {
  let doc = `<br /><hr class="rounded"><h1><center>Upcoming Events</center></h1>`;
  if (typeof formattedCalendarText === 'function') {
    doc += formattedCalendarText(events);
  }
  doc += '<section>';
  const eventBodies = events.map((event) => {
    const eventData = getAllANEventData(event.href);
    const eventBody = formatEvent(eventData);
    return eventData.status !== 'cancelled' ? eventBody : '';
  });
  doc += eventBodies.join('');
  doc += '</section>';
  return doc;
};

const getHTMLAnnouncements = () => {
  return `<br /><hr class="rounded"><h1><center>Even More</center></h1><section style="display:flex;flex-direction:row;flex-wrap:wrap"><article style="padding:0 .8em;flex-basis:calc((100% - 4rem)/2)"><h2>First title</h2><p>Description of first announcement.</p></article><article style="padding:0 .8em;flex-basis:calc((100% - 4rem)/2)"><h2>Second title</h2><p>Description of second announcement.</p></article></section>`;
};

// This function compiles an HTML message of upcoming events and returns it as a string
const compileHTMLEmail = (nextdays) => {
  return getHTMLTopAnnouncement() + getHTMLEvents(getSortedUpcomingANEventIDs(nextdays)) + getHTMLAnnouncements();
};

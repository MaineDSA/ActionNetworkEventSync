// Get the script properties object for use throughout the script
const scriptProperties = PropertiesService.getScriptProperties();

// Set standard API parameters for use in requests to the Action Network API
const standard_api_params = (api_key) => {
  return {
    headers: {
      "OSDI-API-Token": api_key,
    },
    contentType: "application/hal+json",
  };
};

// Set constants for API URLs and default values
const apiUrlAn = "https://actionnetwork.org/api/v2/";
const default_length_mins = 90;
const recently_modified = 28;
const days_upcoming_email = 28;
const days_upcoming_slack = 1;

const calendarGoogle = CalendarApp.getCalendarById(scriptProperties.getProperty("GCAL_ID"));

// This function syncs events modified in the last week from Action Network to Google Calendar
const syncANtoGCal = () => {
  if (!calendarGoogle) {
    Logger.log('No Google Calendar ID "GCAL_ID" provided, cannot continue.');
    return;
  }

  const api_keys = scriptProperties.getProperty("AN_API_KEY").split(",");
  for (const api_key of api_keys) {
    const event_ids = getRecentlyModifiedEventIDs(recently_modified, api_key);
    Logger.log(
      `Found ${event_ids.length} events modified in the last ${recently_modified} days that have not started yet.`,
    );

    for (const event_id of event_ids) {
      const event = getAllANEventData(event_id.href, api_key); // Get all event data for the current event ID

      const action_network_id = getEventIDFromAN(event, "action_network"); // Get the Action Network ID for the event
      Logger.log(
        `${event.title.trim()} is listed as ${event.status} in Action Network at ${action_network_id}.`,
      );

      // If no Google ID is found for the event, we will assume it is not yet in Google Calendar.
      const google_id = getEventIDFromAN(event, "google_id");
      if (!google_id) {
        // If the event is not in Google Calendar
        if (event.status !== "cancelled") {
          // If the event is not cancelled in Action Network, create it in Google Calendar
          const google_id_new = createEvent(event, action_network_id, api_key);
          if (scriptProperties.getProperty("SLACK_WEBHOOK_URL")) {
            if (typeof google_id_new == "string") {
              const link_url = event.browser_url
              const image_url = event.featured_image_url ? event.featured_image_url : null;
              sendSlackMessage("New Event Added to the Calendar", formatSlackEventAnnouncement(event), link_url, image_url);
              Logger.log(`Sent Slack message for ID: ${google_id_new}`);
            }
          }
        }
      } else {
        // If the event is in Google Calendar
        // If the event was cancelled in Action Network, cancel it in Google Calendar
        if (event.status === "cancelled") {
          const google_id_new = cancelGoogleEvent(event, action_network_id, google_id);
          if (typeof google_id_new == "string") {
            if (scriptProperties.getProperty("SLACK_WEBHOOK_URL")) {
              sendSlackMessage("Calendar Event Canceled", formatSlackEventAnnouncement(event), null, null);
              Logger.log(`Sent Slack message for ID: ${google_id_new}`);
            }
          }
        } else {
          updateGoogleEvent(event, action_network_id, google_id);
        }
      }
    }
  }
};

// Calls the draftANMessage function with the output of the compileHTMLEmail() function as an argument.
const draftANEventMessage = () => {
  const date_filter = getUpcomingEventLimitFilter(days_upcoming_email);
  const first_api_key = scriptProperties.getProperty("AN_API_KEY").split(",")[0];
  const event_ids = getSortedANEventIDs(date_filter, first_api_key);
  const email_html = compileHTMLEmail(event_ids, first_api_key);
  draftANMessage(email_html, first_api_key);
};

const postTodaysEvents = () => {
  // Check if the Slack Webhook URL is provided
  if (!scriptProperties.getProperty("SLACK_WEBHOOK_URL")) {
    Logger.log('No Slack Webhook URL "SLACK_WEBHOOK_URL" provided, cannot continue.');
    return;
  }

  const api_keys = scriptProperties.getProperty("AN_API_KEY").split(",");
  for (const api_key of api_keys) {
    const event_ids = getSortedANEventIDs(getUpcomingEventLimitFilter(days_upcoming_slack), api_key);
    Logger.log(
      `Found ${event_ids.length} events coming up in the next ${days_upcoming_slack} ${days_upcoming_slack === 1 ? "day" : "days"}.`,
    );

    // Skip this AN group if there are no events today
    if (event_ids.length === 0) {
      Logger.log("There are no events today. No message will be posted.");
      continue;
    }

    for (const event_id of event_ids) {
      const event = getAllANEventData(event_id.href, api_key); // Get all event data for the current event ID
      Logger.log(`${event.title.trim()} is listed as ${event.status} in Action Network.`);

      if (event.status !== "cancelled") {
        const link_url = event.browser_url
        const image_url = event.featured_image_url ? event.featured_image_url : null;
        sendSlackMessage("Upcoming Event", formatSlackEventAnnouncement(event), link_url, image_url);
      }
    }
  }
};

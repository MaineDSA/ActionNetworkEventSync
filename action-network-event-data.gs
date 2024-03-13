// This function gets the start time of an event, based on the event's location time zone.
const getStartTime = (event) => {
    const start_date = new Date(event.start_date);
    return new Date(start_date.toUTCString() + ' ' + dstOffset(start_date));
};

// This function gets the end time of an event, based on the event's location time zone.
const getEndTime = (event) => {
    const start_date = getStartTime(event);
    const end_date = new Date(event.end_date);
    let output_date = new Date(end_date.toUTCString() + ' ' + dstOffset(end_date))
    if (isNaN(output_date.getUTCFullYear())) {
        output_date = new Date(start_date.getTime() + (60 * 1000 * default_length_mins))
    }
    return output_date;
};

// This function returns the requested event ID if it is found in the Action Network event data.
const getEventIDFromAN = (contentJSON, search_id) => {
    const identifiers = contentJSON.identifiers;
    const search_id_full = `${search_id}:[^,]*`;

    const regex_id = new RegExp(search_id_full)
        .exec(identifiers);
    if (regex_id === null) {
        Logger.log(`${search_id} not found in Action Network event identifiers.`);
        return null;
    }

    const found_id = regex_id[0].substring(search_id_full.indexOf('['));
    Logger.log(`${search_id} found in Action Network event identifiers: ${found_id}`);

    return found_id;
};

// This function returns all event data for an event ID from Action Network.
const getAllANEventData = (event_url, api_key) => {
    return JSON.parse(UrlFetchApp.fetch(event_url, standard_api_params(api_key)))
};

// This function tags an Action Network event with the Google ID for its corresponding Google Calendar event
const tagANEvent = (action_network_id, google_id, api_key) => {
    // Check if the "AN_API_KEY" property is null
    if (api_key === null) {
        Logger.log('No Action Network API Key "AN_API_KEY" provided, cannot continue.');
        return;
    }

    Logger.log(`Tagging Action Network event ${action_network_id} with Google Calendar event ID ${google_id}`);

    // Create a payload for the PUT request to Action Network, adding the Google ID as an identifier on the event
    const payload = JSON.stringify({
        "identifiers": [`google_id:${google_id}`]
    });

    // Set the options for the request and send it to Action Network, logging the response
    const options = {
        method: "put",
        payload: payload,
        headers: {
            'Content-Type': 'application/json',
            'OSDI-API-Token': api_key
        }
    };

    UrlFetchApp.fetch(apiUrlAn + `events/${action_network_id}`, options);
};

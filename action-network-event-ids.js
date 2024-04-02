// This function returns event IDs from Action Network. If a filter is provided, it appends it to the API URL.
const getANEventIDs = (filter, api_key) => {
  let url = `${apiUrlAn}events/`;
  if (filter != null) {
    Logger.log(`Finding upcoming events via filter query ${filter}.`);
    url += filter;
  }
  const content = UrlFetchApp.fetch(url, standard_api_params(api_key));
  return JSON.parse(content)["_links"]["osdi:events"];
};

// This function sorts event IDs by date, based on the start time of the event.
// It is used by the getSortedANEventIDs function to sort the event IDs by the soonest event first.
const sortIDByDate = (a, b, api_key) => {
  const startTimeA = getStartTime(getAllANEventData(a.href, api_key));
  const startTimeB = getStartTime(getAllANEventData(b.href, api_key));
  return startTimeA - startTimeB;
};

// This function returns upcoming event IDs from Action Network, sorted by the soonest event first.
// If a filter is provided, it appends it to the API URL.
const getSortedANEventIDs = (extrafilters, api_key) => {
  let filter = `?filter=start_date gt '${Utilities.formatDate(new Date(), "UTC", "yyyy-MM-dd")}'`;

  if (extrafilters) {
    extrafilters.forEach((extrafilter) => {
      if (extrafilter) {
        filter += ` and ${extrafilter}`;
      }
    });
  }

  const event_ids = getANEventIDs(filter, api_key);
  Logger.log(`Sorting ${event_ids.length} events by soonest`);

  return event_ids.sort((a, b) => sortIDByDate(a, b, api_key));
};

// This function returns event IDs from Action Network for events modified since a certain number of days ago that have not started yet.
// It calculates the date to filter events by based on the current date and the number of days ago.
// It uses the getSortedANEventIDs function to return the IDs sorted by soonest event first.
const getRecentlyModifiedEventIDs = (daysago, api_key) => {
  const MILLIS_PER_DAY = 1000 * 60 * 60 * 24;
  const now = new Date();
  const daysago_date = new Date(now.getTime() - MILLIS_PER_DAY * daysago);
  const extrafilters = [`modified_date gt '${Utilities.formatDate(daysago_date, "UTC", "yyyy-MM-dd")}'`];

  return getSortedANEventIDs(extrafilters, api_key);
};

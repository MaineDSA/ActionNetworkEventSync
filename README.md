# ActionNetworkScript
Automation for Action Network

## Features
This Google Apps Script code simplifies some more labor-intensive Action Network tasks:
- **syncANtoGCal()** Retrieving a list of recently-edited Action Network events and syncing them to Google Calendar.
- **emailFormattedEventList()** Retriving a list of upcoming Action Network events and compiling them into an HTML-formatted Action Network email draft.
- **draftANEventMessage()** Retriving a list of upcoming Action Network events and compiling them into an HTML-formatted email to be sent to a single address.

## Script Properties
To use these features, you must configure [Script Properties](https://developers.google.com/apps-script/reference/properties) in your Google Apps script.
- AN_API_KEY: Your Action Network API Key.
- AN_API_URL: Your Action Network API URL (https://actionnetwork.org/api/v2/).
- AN_EMAIL_REPLY_TO: The email you want generated AN email drafts to use as the reply-to address.
- AN_EMAIL_SENDER: The name you want displayed as the sender for generated AN email drafts.
- AN_EMAIL_SUBJECT: The subject you want used for the generated AN email drafts.
- AN_EMAIL_WRAPPER: The wrapper you want to use for the generated AN email drafts.
- AN_EMAIL_CREATOR: The AN Network User to use for the generated AN email drafts.
- AN_ORIGIN_SYSTEM: Internal code used to show where an AN entry originated from. We use ActionNetworkScript.
- EVENTS_EMAIL: The email you want to send a list of events to (such as when not using AN draft generation).
- GCAL_ID: The calendar ID of your Google Calendar including the @domain.com part.
- LINK_COLOR: Preferred color for HTML links in HTML-formatted email bodies as a hex code. We use ec1f27.
- TIME_DST: The time zone you use during Daylight Savings Time. We use GMT-04:00.
- TIME_STANDARD: The time zone you use outside of Daylight Savings Time. We use GMT-05:00

## Triggering
- Our script is set to call syncANtoGCal() every 10 minutes.
- Our script is set to call draftANEventMessage() every Tuesday morning.

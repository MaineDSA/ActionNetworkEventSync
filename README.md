[![CodeQL](https://github.com/MaineDSA/ActionNetworkEventSync/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/MaineDSA/ActionNetworkEventSync/actions/workflows/github-code-scanning/codeql)
[![DevSkim](https://github.com/MaineDSA/ActionNetworkEventSync/actions/workflows/devskim.yml/badge.svg)](https://github.com/MaineDSA/ActionNetworkEventSync/actions/workflows/devskim.yml)

# ActionNetworkScript
Automation for Action Network

## Features
This Google Apps Script code simplifies some more labor-intensive Action Network tasks:
- **syncANtoGCal()** Retrieving a list of recently-edited Action Network events and syncing them to Google Calendar.
- **draftANEventMessage()** Retriving a list of upcoming Action Network events and compiling them into an HTML-formatted email to be sent to a single address.
- **emailFormattedEventList()** Retriving a list of upcoming Action Network events and compiling them into an HTML-formatted Gmail email.
- **postTodaysEvents()** Retriving a list of upcoming Action Network events and compiling them into a regular Slack post.

## Screenshots
### Generated Email
<a href="https://github.com/MaineDSA/ActionNetworkEventSync/assets/1916835/7a017df7-5a18-408e-aa7d-d85ec40fcfc1"><img src="https://github.com/MaineDSA/ActionNetworkEventSync/assets/1916835/7a017df7-5a18-408e-aa7d-d85ec40fcfc1" alt="Example of Generated Action Network Draft" align="left" height="520"></a>

### New Event Notification in Slack
<a href="https://github.com/MaineDSA/ActionNetworkEventSync/assets/1916835/a211d773-0be6-4421-a6b4-d63bfb7b2bf9"><img src="https://github.com/MaineDSA/ActionNetworkEventSync/assets/1916835/a211d773-0be6-4421-a6b4-d63bfb7b2bf9" alt="Slack Message announcing new event" height="480"></a>

## Script Properties
To use these features, you must configure [Script Properties](https://developers.google.com/apps-script/reference/properties) in your Google Apps script.
- AN_API_KEY: Your Action Network API Key.
- AN_EMAIL_REPLY_TO: The email you want generated AN email drafts to use as the reply-to address.
- AN_EMAIL_SENDER: The name you want displayed as the sender for generated AN email.
- AN_EMAIL_WRAPPER: (OPTIONAL) The wrapper you want to use for the generated AN email drafts.
- AN_EMAIL_CREATOR: (OPTIONAL) The AN Network User to use for the generated AN email drafts.
- EMAIL_SUBJECT: The subject you want used for the generated AN email drafts.
- EMAIL_TARGET: (OPTIONAL) The default AN Query you want used for the generated AN email drafts.
- EVENTS_EMAIL: (OPTIONAL) The email you want to send a list of events to (such as when not using AN draft generation).
- GCAL_ID: The calendar ID of your Google Calendar including the @domain.com part.
- LINK_COLOR: Preferred color for HTML links in HTML-formatted email bodies as a hex code. We use ec1f27.
- TIME_DST: The time zone you use during Daylight Savings Time. We use GMT-04:00.
- TIME_STANDARD: The time zone you use outside of Daylight Savings Time. We use GMT-05:00
- SLACK_WEBHOOK_URL: (OPTIONAL) A Slack webhook URL to notify when creating or canceling upcoming Google Calendar events and for the daily upcoming events digest.

# Additional Customization
As some desired customization cannot be attained through properties, some tie-in points are provided.
Creating the following functions in a new script file will allow you to insert additional text at key places.
If not configured, these will be skipped.
- formattedDescriptionFooter(formatted_event_description): Creating this function allows you to add an HTML-formatted string to the end of each event, as posted to Google Calendar.
- formattedCalendarText(events): Creating this function allows you to add additional information to the "Upcoming Events" section, between the header and list of events.

## Triggering
- Our script is set to call syncANtoGCal() every 10 minutes.
- Our script is set to call draftANEventMessage() every Tuesday morning.
- Our script is set to call postTodaysEvents() every morning.

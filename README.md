[![CodeQL](https://github.com/MaineDSA/ActionNetworkEventSync/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/MaineDSA/ActionNetworkEventSync/actions/workflows/github-code-scanning/codeql)
[![JS Checks](https://github.com/MaineDSA/ActionNetworkEventSync/actions/workflows/javascript.yml/badge.svg)](https://github.com/MaineDSA/ActionNetworkEventSync/actions/workflows/javascript.yml)

# ActionNetworkEventScript

Automation for Action Network, Google Calendar, and Slack

## Features

This Google Apps Script code simplifies some more labor-intensive Action Network tasks:

- **syncANtoGCal()** Retrieve a list of recently-edited Action Network events from each API key and sync them to Google Calendar.
- **draftANEventMessage()** Retrive a list of upcoming Action Network events and compile them into an HTML-formatted
email draft on the Action Network group found at the first API key.
- **postTodaysEvents()** Retrive upcoming Action Network events from each API key and send notice to Slack or Discord.

## Screenshots

### Generated Email

<a href="https://github.com/user-attachments/assets/3d202d3d-a4c5-4b58-8379-ce5d441ff4c8">
  <img src="https://github.com/user-attachments/assets/3d202d3d-a4c5-4b58-8379-ce5d441ff4c8" alt="Example of a machine-generated Action Network newsletter Draft" align="left" height="520">
</a>

### New Event Notification in Slack

<a href="https://github.com/user-attachments/assets/f4d0b5c2-c391-4af5-80f7-8a7802696d28">
  <img src="https://github.com/user-attachments/assets/f4d0b5c2-c391-4af5-80f7-8a7802696d28" alt="Slack Message announcing new event, with RSVP button" height="250">
</a>

### New Event Notification in Discord

<a href="https://github.com/user-attachments/assets/3177d7c0-36b3-4d02-9d8f-7b03222ffd93">
  <img src="https://github.com/user-attachments/assets/3177d7c0-36b3-4d02-9d8f-7b03222ffd93" alt="Discord Message announcing new event, with link to event page" height="250">
</a>


## Script Properties

To use these features, you must configure
[Script Properties](https://developers.google.com/apps-script/reference/properties)
in your Google Apps script.

- AN_API_KEY: Your Action Network API Key (or a comma-separated list if you have multiple groups -- with multiple groups, the first group should be the primary/parent group).
- AN_EMAIL_REPLY_TO: The email you want generated AN email drafts to use as the reply-to address.
- AN_EMAIL_SENDER: The name you want displayed as the sender for generated AN email.
- AN_EMAIL_WRAPPER: (OPTIONAL) The wrapper you want to use for the generated AN email drafts.
- AN_EMAIL_CREATOR: (OPTIONAL) The AN Network User to use for the generated AN email drafts.
- EMAIL_SUBJECT: The subject you want used for the generated AN email drafts.
- EMAIL_TARGET: (OPTIONAL) The default AN Query you want used for the generated AN email drafts.
- EVENTS_EMAIL: (OPTIONAL) The email you want to send a list of events to (such as when not using AN draft
  generation).
- GCAL_ID: The calendar ID of your Google Calendar including the @domain.com part.
- TIME_DST: The time zone you use during Daylight Savings Time. We use GMT-04:00.
- TIME_STANDARD: The time zone you use outside of Daylight Savings Time. We use GMT-05:00
- SLACK_WEBHOOK_URL: (OPTIONAL) A Slack webhook URL to notify when creating or canceling upcoming Google
  Calendar events and for the regular upcoming events posts.
- DISCORD_WEBHOOK_URL: (OPTIONAL) A Discord webhook URL to notify when creating or canceling upcoming Google
  Calendar events and for the regular upcoming events posts.

# Additional Customization

As some desired customization cannot be attained through properties, some tie-in points are provided.
Creating the following functions in a new script file will allow you to insert additional text at key places.
If not configured, these will be skipped.

- customEventDescriptionFooter(formatted_event_description): Creating this
function allows you to add an HTML-formatted string to the end of each event,
as posted to Google Calendar.
- customNewsletterEventHeaderText(events): Creating this function allows you to add additional information to the "Upcoming Events" section,
between the header and list of events.
- customAnnouncements(): Creating this function allows you to add additional
announcements, articles, etc after the list of upcoming events.

## Triggering

- Our script is set to call syncANtoGCal() every 30 minutes.
- Our script is set to call draftANEventMessage() every Tuesday morning.
- Our script is set to call postTodaysEvents() every morning.

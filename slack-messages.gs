const formatSlackEventAnnouncement = (event) => {
  const event_date = getStartTime(event).toLocaleDateString("en-US", { weekday: "long", month: 'long', day: "2-digit", hour: "numeric", minute: "2-digit" })

  let message = ''
  message += '\n*' + event.title.trim() + '*'
  message += '\n' + event_date
  message += '\n' + 'RSVP: ' + event.browser_url

  return message
}

// Sends a message via Slack.
const sendSlackMessage = (message) => {

  let slackMessage = {
    text: message
  }

  let options = {
    method: 'POST',
    contentType: 'application/json',
    payload: JSON.stringify(slackMessage)
  }

  UrlFetchApp.fetch(scriptProperties.getProperty("SLACK_WEBHOOK_URL"), options)

}

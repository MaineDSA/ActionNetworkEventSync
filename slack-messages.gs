const formatSlackEventAnnouncement = (event) => {
  const event_date = getStartTime(event).toLocaleDateString("en-US", { weekday: "long", month: 'long', day: "2-digit", hour: "numeric", minute: "2-digit" });

  let message = ''
  message += '\n*' + event.title.trim() + '*'
  message += '\n' + event_date
  message += '\n' + 'RSVP: ' + encodeURI(event.browser_url)

  return message
}

// Sends a message via Slack.
const sendSlackMessage = (message, image) => {

  if (scriptProperties.getProperty("SLACK_WEBHOOK_URL") === null) {Logger.log('No Slack Webhook URL "SLACK_WEBHOOK_URL" provided, cannot continue.'); return }

  let slackMessage = { attachments: [ {} ] }
  if (message != null) { slackMessage.text = message }
  if (image != null) { slackMessage.attachments = [ { 'image_url': encodeURI(image) } ] }
  if (slackMessage === { attachments: [ {} ] }) { return }

  let options = {
    method: 'POST',
    contentType: 'application/json',
    payload: JSON.stringify(slackMessage)
  };

  UrlFetchApp.fetch(scriptProperties.getProperty("SLACK_WEBHOOK_URL"), options);

}

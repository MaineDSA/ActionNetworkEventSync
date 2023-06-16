// Sends a message via Slack.
const sendSlackMessage = (event, headline) => {

  const event_date = getStartTime(event).toLocaleDateString("en-US", { weekday: "long", month: "2-digit", day: "2-digit", hour: "numeric", minute: "2-digit" });

  var message = headline
  message += '\n*' + event.title.trim() + '*'
  message += '\n' + event_date
  message += '\n' + 'RSVP: ' + event.browser_url

  var slackMessage = {
    text: message
  };

  var options = {
    method: 'POST',
    contentType: 'application/json',
    payload: JSON.stringify(slackMessage)
  };

  UrlFetchApp.fetch(scriptProperties.getProperty("SLACK_WEBHOOK_URL"), options);

}

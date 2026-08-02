/* eslint-disable no-unused-vars */
/**
 * Coordinate formatting and sending a message via the correct send function.
 */
function sendMessage (property, actionNetworkEvent, messageTitle, sendFunction) {
  if (scriptProperties.getProperty(property)) {
    const eventAnnouncementMsg = formatEventAnnouncementMessage(actionNetworkEvent)
    const linkURL = actionNetworkEvent.browser_url
    const imageURL = actionNetworkEvent.featured_image_url ? actionNetworkEvent.featured_image_url : null
    sendFunction(
      messageTitle,
      eventAnnouncementMsg,
      linkURL,
      imageURL
    )
  }
  console.info(`Sent message to webhook to event for ${actionNetworkEvent.title.trim()}.`)
}

/**
 * Post an event message to Slack and/or Discord if the event has not been cancelled.
 */
function postEventMessage (event) {
  console.log(`${event.title.trim()} is listed as ${event.status} in Action Network at ${getEventIDFromAN(event, 'action_network')} and starts on ${getStartTime(event)}.`)

  if (event.status === 'cancelled') {
    console.log(`Skipping cancelled event ${event.title.trim()}.`)
    return
  }

  if (scriptProperties.getProperty('SLACK_WEBHOOK_URL')) {
    sendMessage('SLACK_WEBHOOK_URL', event, 'Upcoming Event', sendSlackMessage)
  }
  if (scriptProperties.getProperty('DISCORD_WEBHOOK_URL')) {
    sendMessage('DISCORD_WEBHOOK_URL', event, 'Upcoming Event', sendDiscordMessage)
  }
}

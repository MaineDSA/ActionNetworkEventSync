/* eslint-disable no-unused-vars */
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

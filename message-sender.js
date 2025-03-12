/* eslint-disable no-unused-vars */
function sendMessage (property, event, messageTitle, sendFunction) {
  if (scriptProperties.getProperty(property)) {
    const eventAnnouncementMsg = formatEventAnnouncementMessage(event)
    const linkURL = event.browser_url
    const imageURL = event.featured_image_url ? event.featured_image_url : null
    sendFunction(
      messageTitle,
      eventAnnouncementMsg,
      linkURL,
      imageURL
    )
  }
  Logger.log(`Sent message to webhook to event for ${event.title.trim()}.`)
}

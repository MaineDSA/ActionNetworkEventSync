/* eslint-disable no-unused-vars */
// Sends a message via Discord.
function sendDiscordMessage (title, message, url, image) {
  if (scriptProperties.getProperty('DISCORD_WEBHOOK_URL') === null) {
    Logger.log('No Discord Webhook URL "DISCORD_WEBHOOK_URL" provided, cannot continue.')
    return
  }
  if (!title || !message) {
    Logger.log('Discord message or title not provided, cannot continue.')
    return
  }

  const discordWebhookMessage = {
    content: `**${title}**\n${message}`, // Title and message
    embeds: [] // To store embeds (for image or additional data)
  }

  // Add URL if provided
  if (url) {
    discordWebhookMessage.embeds.push({
      description: `For more details, click [here](${encodeURI(url + '?source=discord-bot')}).`,
      color: 3447003 // Optional color for embed, you can adjust this
    })
  }

  // Add image if provided
  if (image) {
    discordWebhookMessage.embeds.push({
      image: {
        url: image
      },
      color: 3447003 // Optional color for embed
    })
  }

  const options = {
    method: 'POST',
    contentType: 'application/json',
    payload: JSON.stringify(discordWebhookMessage)
  }

  UrlFetchApp.fetch(scriptProperties.getProperty('DISCORD_WEBHOOK_URL'), options)
}

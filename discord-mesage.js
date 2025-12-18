/* eslint-disable no-unused-vars */
// Sends a message via Discord.
function sendDiscordMessage (title, message, url, image) {
  if (!scriptProperties.getProperty('DISCORD_WEBHOOK_URL')) {
    console.error('No Discord Webhook URL "DISCORD_WEBHOOK_URL" provided, cannot continue.')
    return
  }
  if (!title || !message) {
    console.error('Discord message or title not provided, cannot continue.')
    return
  }

  const discordWebhookMessage = {
    content: `## **${title}**\n${message}`,
    embeds: [],
    components: []
  }

  // Add image if provided
  if (image) {
    discordWebhookMessage.embeds.push({
      image: {
        url: image
      },
      color: 3447003
    })
  }

  // Add RSVP button if URL is provided
  if (url) {
    discordWebhookMessage.components.push({
      type: 1, // Action Row
      components: [
        {
          type: 2, // Button
          style: 5, // Link button
          label: 'Details and RSVP',
          url: encodeURI(url + '?source=discord-rsvp')
        }
      ]
    })
  }

  const options = {
    method: 'POST',
    contentType: 'application/json',
    payload: JSON.stringify(discordWebhookMessage)
  }

  UrlFetchApp.fetch(scriptProperties.getProperty('DISCORD_WEBHOOK_URL'), options)
}

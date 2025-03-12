/* eslint-disable no-unused-vars */
// Sends a message via Slack.
function sendSlackMessage (title, message, url, image) {
  if (!scriptProperties.getProperty('SLACK_WEBHOOK_URL')) {
    Logger.log('No Slack Webhook URL "SLACK_WEBHOOK_URL" provided, cannot continue.')
    return
  }
  if (!title || !message) {
    Logger.log('Slack message or title not provided, cannot continue.')
    return
  }

  const slackWebhookMessage = {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: title
        }
      },
      {
        type: 'section',
        block_id: 'event_info',
        text: {
          type: 'mrkdwn',
          text: message
        }
      }
    ]
  }
  if (url) {
    slackWebhookMessage.blocks.push({
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'Details and RSVP'
          },
          url: encodeURI(url + '?source=slack-bot'),
          accessibility_label: 'Open Action Network in a browser for full event details'
        }
      ]
    })
  }
  if (image) {
    slackWebhookMessage.blocks.find((block) => block.block_id === 'event_info').accessory = {
      type: 'image',
      image_url: image,
      alt_text: 'featured event image'
    }
  }
  const options = {
    method: 'POST',
    contentType: 'application/json',
    payload: JSON.stringify(slackWebhookMessage)
  }

  UrlFetchApp.fetch(scriptProperties.getProperty('SLACK_WEBHOOK_URL'), options)
}

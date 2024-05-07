const formatSlackEventAnnouncement = (event) => {
  const startstring = getStartTime(event).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
  });
  return `*${event.title.trim()}*\n${startstring}`;
};

// Sends a message via Slack.
const sendSlackMessage = (title, message, url, image) => {
  if (scriptProperties.getProperty("SLACK_WEBHOOK_URL") === null) {
    Logger.log('No Slack Webhook URL "SLACK_WEBHOOK_URL" provided, cannot continue.');
    return;
  }
  if (!title || !message) {
    Logger.log("Slack message or title not provided, cannot continue.");
    return;
  }

  const slack_webhook_message = {
    text: `${title}:\n${message}`,
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: title,
        },
      },
      {
        type: "section",
        block_id: "event_info",
        text: {
          type: "mrkdwn",
          text: message,
        },
      },
      ...(url
        ? {
            type: "button",
            text: {
              type: "plain_text",
              text: "Details and RSVP",
            },
            url: encodeURI(url),
            accessibility_label: "Open Action Network in a browser for full event details",
          }
        : null),
      ...(image
        ? {
            accessory: {
              type: "image",
              image_url: image,
              alt_text: "featured event image",
            },
          }
        : null),
    ],
  };
  const options = {
    method: "POST",
    contentType: "application/json",
    payload: JSON.stringify(slack_webhook_message),
  };

  UrlFetchApp.fetch(scriptProperties.getProperty("SLACK_WEBHOOK_URL"), options);
};

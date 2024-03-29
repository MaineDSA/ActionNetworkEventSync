const formatSlackEventAnnouncement = (event) => {
    startstring = getStartTime(event)
        .toLocaleDateString("en-US", {
            weekday: "long",
            month: 'long',
            day: "2-digit",
            hour: "numeric",
            minute: "2-digit"
        })
    return `\n*${event.title.trim()}*\n${startstring}\nRSVP: ${encodeURI(event.browser_url)}`;
};

// Sends a message via Slack.
const sendSlackMessage = (message) => {
    if (scriptProperties.getProperty("SLACK_WEBHOOK_URL") === null) {
        Logger.log('No Slack Webhook URL "SLACK_WEBHOOK_URL" provided, cannot continue.');
        return
    }

    let slackMessage = {
        attachments: [{}]
    }
    if (message) {
        slackMessage.text = message
    } else {
        return
    }

    const options = {
        method: 'POST',
        contentType: 'application/json',
        payload: JSON.stringify(slackMessage)
    };

    UrlFetchApp.fetch(scriptProperties.getProperty("SLACK_WEBHOOK_URL"), options);
};

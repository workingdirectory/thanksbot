const { createEventAdapter } = require('@slack/events-api');
const slackWeb = require('./slackWeb');

const slackEvents = createEventAdapter(process.env.SLACK_SIGNING_SECRET, {
    waitForResponse: true
});

slackEvents.on('message', (event, respond) => {
    // Be sure to acknowledge the event to prevent duplicate
    // message events: https://api.slack.com/events-api#graceful_retries
    respond();

    const { channel, team, text } = event;
    const webAPI = new slackWeb(team);

    if (event.channel_type === 'im' && event.client_msg_id) {
        webAPI.confirmThankYou(text, channel);
    }
});

slackEvents.on('error', (error, respond) => {
    console.error(error);
    respond(error, { status: 500 });
});

module.exports = slackEvents;

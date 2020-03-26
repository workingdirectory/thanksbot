const { createEventAdapter } = require('@slack/events-api');
const slackWeb = require('./slackWeb');

const slackEvents = createEventAdapter(process.env.SLACK_SIGNING_SECRET);

slackEvents.on('message', async event => {
    const { channel, team, text } = event;
    const webAPI = new slackWeb(team);

    if (event.channel_type === 'im' && event.client_msg_id) {
        webAPI.confirmThankYou(text, channel);
    }
});

slackEvents.on('error', console.error);

module.exports = slackEvents;

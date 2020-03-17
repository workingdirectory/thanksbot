const { createEventAdapter } = require('@slack/events-api');
const { confirmThankYou } = require('./slackWeb');

const slackEvents = createEventAdapter(process.env.SLACK_SIGNING_SECRET);

slackEvents.on('message', async event => {
    const { channel, text } = event;

    if (event.channel_type === 'im' && event.client_msg_id) {
        confirmThankYou(text, channel);
    }
});
slackEvents.on('error', console.error);

module.exports = slackEvents;

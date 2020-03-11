const { createEventAdapter } = require('@slack/events-api');
const { WebClient } = require('@slack/web-api');
const dayjs = require('dayjs');

const slackEvents = createEventAdapter(process.env.SLACK_SIGNING_SECRET);
const slackWeb = new WebClient(process.env.SLACK_TOKEN);

async function getDisplayName(userId) {
    const { user } = await slackWeb.users.info({
        token: process.env.SLACK_TOKEN,
        user: userId
    });

    return user.name;
}

function parseMessage(text) {
    // parse message text for user IDs, replace with display names
}

function confirmThankYou(text) {
    // send message that repeats the thank you text to confirm spelling
    // replace text if not correct
}

/*
 * store message along with sender's display name
 */
async function storeThankYou(name, text) {
    const nextMonday = dayjs()
        .day(1)
        .add(7, 'day');

    try {
        await slackWeb.chat.scheduleMessage({
            channel: '#general',
            text: `${name}: ${text}`,
            post_at: nextMonday.unix()
        });

        console.log(await slackWeb.chat.scheduledMessages.list());
    } catch (error) {
        console.log(error);
    }
}

slackEvents.on('message', async event => {
    const { text, user } = event;
    const name = await getDisplayName(user);

    storeThankYou(name, text);
});
slackEvents.on('error', console.error);

module.exports = slackEvents;

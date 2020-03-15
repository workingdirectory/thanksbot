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

async function formatThankYou(tyObj, previousText) {
    let intro =
        previousText ||
        '✨🙏✨ We have some thank yous this week, hooray! ✨☺️✨';

    for (const [name, text] of Object.entries(tyObj)) {
        intro += `\n - ${name} says ${text}`;
    }

    return intro;
}

async function getExistingThankYou() {
    let { scheduled_messages } = await slackWeb.chat.scheduledMessages.list();

    if (scheduled_messages.length) {
        return scheduled_messages.find(({ text }) => {
            return text.includes('We have some thank yous');
        });
    }

    return null;
}

/*
 * store message along with sender's display name
 */
async function storeThankYou(name, text) {
    const nextMonday = dayjs()
        .day(1)
        .add(7, 'day');

    const previousTy = await getExistingThankYou();
    const previousText = previousTy ? previousTy.text : null;
    const tyText = await formatThankYou({ [name]: text }, previousText);

    try {
        await slackWeb.chat.scheduleMessage({
            channel: '#general',
            text: tyText,
            post_at: nextMonday.unix()
        });
    } catch (error) {
        console.log(error);
    }
}

slackEvents.on('message', async event => {
    const { text, user } = event;

    if (event.channel_type === 'im') {
        const name = await getDisplayName(user);
        storeThankYou(name, text);
    }
});
slackEvents.on('error', console.error);

module.exports = slackEvents;

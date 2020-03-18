const dayjs = require('dayjs');
const { WebClient } = require('@slack/web-api');

const slackWeb = new WebClient(process.env.SLACK_TOKEN);

function formatThankYou(tyObj, previousText = null) {
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
exports.storeThankYou = async function(user, text) {
    const nextMonday = dayjs()
        .day(1)
        .hour(12)
        .minute(0)
        .add(7, 'day');

    const previousTy = await getExistingThankYou();
    const previousText = previousTy ? previousTy.text : null;
    const tyText = formatThankYou(
        { [`@${user.username}`]: text },
        previousText
    );

    if (previousTy) {
        slackWeb.chat.deleteScheduledMessage({
            channel: previousTy.channel_id,
            scheduled_message_id: previousTy.id
        });
    }

    try {
        await slackWeb.chat.scheduleMessage({
            channel: '#general',
            text: tyText,
            post_at: nextMonday.unix(),
            link_names: true
        });
    } catch (error) {
        console.log(error);
    }
};

/**
 * send message that repeats the thank you text to confirm spelling
 */
exports.confirmThankYou = async function(tyText, channel) {
    try {
        await slackWeb.chat.postMessage({
            channel,
            blocks: [
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: `
                        Thank you for your thank you! Before I pass your appreciation along, do I have this message right? \n \`${tyText}\`
                        `
                    }
                },
                {
                    type: 'actions',
                    elements: [
                        {
                            type: 'button',
                            text: {
                                type: 'plain_text',
                                text: 'Confirm'
                            },
                            style: 'primary',
                            value: tyText
                        },
                        {
                            type: 'button',
                            text: {
                                type: 'plain_text',
                                text: 'Cancel'
                            },
                            value: 'cancel'
                        }
                    ]
                }
            ]
        });
    } catch (error) {
        console.log(error);
    }
};

exports.tyReminder = async function() {
    try {
        await slackWeb.chat.postMessage({
            channel: '#general',
            text:
                '👋 Howdy! Feeling like someone in this community has been helpful or kind this week? Send thanksbot a direct message to acknowledge this person! Your shout out will be posted on Monday 💪 🎉'
        });
    } catch (error) {
        console.log(error);
    }
};

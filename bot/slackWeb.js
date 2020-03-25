const CronJob = require('cron').CronJob;
const dayjs = require('dayjs');
const { WebClient } = require('@slack/web-api');
const slackAuth = require('./slackAuth');

const DIGEST_POST_DAY = 5;

class webAPI {
    constructor(team) {
        this.team = team;
    }

    /**
     * send message that repeats the thank you text to confirm spelling
     */
    async confirmThankYou(tyText, channel, team) {
        const slackClient = await this.getSlackClient(team);

        try {
            await slackClient.chat.postMessage({
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
    }

    async getExistingThankYou() {
        const slackClient = await this.getSlackClient();

        let {
            scheduled_messages
        } = await slackClient.chat.scheduledMessages.list();

        if (scheduled_messages.length) {
            return scheduled_messages.find(({ text }) => {
                return text.includes('We have some thank yous');
            });
        }

        return null;
    }

    formatThankYou(tyObj, previousText = null) {
        let intro =
            previousText ||
            '✨🙏✨ We have some thank yous this week, hooray! ✨☺️✨';

        for (const [name, text] of Object.entries(tyObj)) {
            intro += `\n - ${name} says ${text}`;
        }

        return intro;
    }

    async getSlackClient(team = null, token = null) {
        if (!token) {
            token = await slackAuth.getSlackToken(team || this.team);
        }

        return new WebClient(token);
    }

    async init(team, token) {
        const slackClient = await this.getSlackClient(team, token);
        const { channels } = await slackClient.conversations.list();
        const { id } = channels.find(({ is_general }) => is_general);
        const reminderMessage = new CronJob(
            '0 45 17 * * 3',
            () => {
                this.tyReminder();
            },
            null,
            true,
            'America/New_York'
        );

        await slackClient.conversations.join({ channel: id });

        reminderMessage.start();
    }

    /*
     * store message along with sender's display name
     */
    async storeThankYou(user, text, team) {
        const slackClient = await this.getSlackClient(team);
        const today = dayjs().day();
        let nextPostDay = dayjs()
            .day(DIGEST_POST_DAY)
            .hour(12)
            .minute(0);

        // DayJS will use today's date value if it is the same as
        // the day of the week we want. If so, add 7 days for the
        // following week's digest posting day
        if (today == DIGEST_POST_DAY) {
            nextPostDay = dayjs(nextPostDay).add(7, 'day');
        }

        const previousTy = await this.getExistingThankYou();
        const previousText = previousTy ? previousTy.text : null;
        const tyText = this.formatThankYou(
            { [`@${user.username}`]: text },
            previousText
        );

        if (previousTy) {
            slackClient.chat.deleteScheduledMessage({
                channel: previousTy.channel_id,
                scheduled_message_id: previousTy.id
            });
        }

        try {
            await slackClient.chat.scheduleMessage({
                channel: '#general',
                text: tyText,
                post_at: nextPostDay.unix(),
                link_names: true
            });
        } catch (error) {
            console.log(error);
        }
    }

    async tyReminder(team = null) {
        const slackClient = await this.getSlackClient(team || this.team);
        try {
            await slackClient.chat.postMessage({
                channel: '#general',
                text:
                    '👋 Howdy! Feeling like someone in this community has been helpful or kind this week? Send thanksbot a direct message to acknowledge this person! Your shout out will be posted on Monday 💪 🎉'
            });
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = webAPI;

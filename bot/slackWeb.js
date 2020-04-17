const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const { WebClient } = require('@slack/web-api');
const slackAuth = require('./slackAuth');

const DIGEST_POST_DAY = 1; // Monday
// This hour values is in UTC time,
// is around 12 EST depending on daylight savings
const DIGEST_POST_HOUR = 16;
const DIGEST_POST_MINUTE = 0;
const THREE_MINUTES = 180;

dayjs.extend(utc);

class webAPI {
    constructor(team) {
        this.team = team;
    }

    /**
     * Send direct message that repeats the thank you text to confirm spelling
     *
     * @param {string} tyText - the direct message a user submitted for the thank you digest
     * @param {string} channel  - the channel id of where the confirmation should be posted,
     *      which is the id of the direct message chat
     */
    async confirmThankYou(tyText, channel) {
        const slackClient = await this.getSlackClient();

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

    /**
     *  Check if a scheduled message exists for the same day as the
     *  timestamp argument `postTime`
     *
     *  @param postTime {integer} - Unix time stamp of the digest post we're
     *      interested in checking for
     */
    async getExistingThankYou(postTime) {
        const slackClient = await this.getSlackClient();

        let {
            scheduled_messages
        } = await slackClient.chat.scheduledMessages.list();

        if (scheduled_messages.length) {
            return scheduled_messages.find(({ post_at }) => {
                let currentPostDay = dayjs.unix(postTime).day();
                let scheduledPostDay = dayjs.unix(post_at).day();

                return currentPostDay === scheduledPostDay;
            });
        }

        return null;
    }

    /**
     * Get a unix timestamp for when this thank you's digest message
     * should be posted
     */
    getPostTime() {
        const today = dayjs().unix();
        let nextPostTime = dayjs()
            .utc()
            .day(DIGEST_POST_DAY)
            .hour(DIGEST_POST_HOUR)
            .minute(DIGEST_POST_MINUTE);

        // Check if we're close to or past the digest posting time
        // and get nexts week's post time if so
        if (today > nextPostTime.unix() - THREE_MINUTES) {
            nextPostTime = dayjs(nextPostTime).add(7, 'day');
        }

        return nextPostTime.unix();
    }

    /**
     * Use this Slack workspace's token to get a Slack web API client
     */
    async getSlackClient() {
        const token = await slackAuth.getSlackToken(this.team);

        return new WebClient(token);
    }

    /**
     * Create the message body of the thank you digest
     *
     * @param {object} tyObj - an object containing the user's username
     *      and their thank you text
     * @param {sting} previousText - if there is existing digest text,
     *      append the newest thank you to it.
     */
    formatThankYou(tyObj, previousText = null) {
        let intro =
            previousText ||
            '✨🙏✨ We have some thank yous this week, hooray! ✨☺️✨';

        for (const [name, text] of Object.entries(tyObj)) {
            intro += `\n\t • ${name} says: ${text}`;
        }

        return intro;
    }

    /**
     *  When adding thanksbot to a workspace for the first time, make sure
     *  it has been added to the #general channel so it can make posts
     */
    async init() {
        const slackClient = await this.getSlackClient();
        const { channels } = await slackClient.conversations.list();
        const { id } = channels.find(({ is_general }) => is_general);

        await slackClient.conversations.join({ channel: id });
    }

    /**
     * Check the upcoming thank you digest's text to see whether this user
     * has already posted the exact same thank you text.
     *
     * @param {string} userId - user who is submitting the thank you text
     *      and their thank you text
     * @param {sting} text - thank you text to check the digest for duplicates
     */
    async isDupeMessage(userId, text) {
        const postTime = this.getPostTime();
        const previousTy = await this.getExistingThankYou(postTime);
        const previousText = previousTy ? previousTy.text : null;

        if (!previousText) return false;

        if (previousText.includes(`<@${userId}> says: ${text}`)) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * store message along with sender's display name
     *
     * @param {object} user - the message event's user information
     * @param {sting} text - thank you text to add to the digest
     */
    async storeThankYou(user, text) {
        const slackClient = await this.getSlackClient();
        const postTime = this.getPostTime();
        const previousTy = await this.getExistingThankYou(postTime);
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
                post_at: postTime,
                link_names: true
            });
        } catch (error) {
            console.log(error);
        }
    }

    /**
     * Post a message to the general channel reminding workspace members to
     * send a thank you
     */
    async tyReminder() {
        const slackClient = await this.getSlackClient();

        try {
            await slackClient.chat.postMessage({
                channel: '#general',
                text:
                    '👋 Howdy! Feeling like someone in this community has been helpful or kind this week? Send thanksbot a direct message to acknowledge this person! Your shout out will be posted Monday 💪 🎉'
            });
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = webAPI;

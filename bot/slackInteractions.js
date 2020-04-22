const { createMessageAdapter } = require('@slack/interactive-messages');
const slackWeb = require('./slackWeb');

const slackInteractions = createMessageAdapter(
    process.env.SLACK_SIGNING_SECRET
);

slackInteractions.action({ type: 'button' }, async (payload, respond) => {
    const {
        user,
        actions,
        team: { id }
    } = payload;
    const { value } = actions[0];
    const webAPI = new slackWeb(id);
    const tyConfirmed = value !== 'cancel';
    const isDupe = await webAPI.isDupeMessage(user.id, value);

    if (isDupe) {
        respond({
            text:
                'Looks like you have submitted duplicate text for this week. Please try another one!',
            response_type: 'in_channel'
        });

        return;
    }

    if (tyConfirmed) {
        respond({
            text:
                ':100: Thank you for your submission! It will be shared in the weekly digest.',
            response_type: 'in_channel'
        });
        webAPI.storeThankYou(user, value);
        webAPI.postPromptMessage();

        return;
    }

    respond({
        text:
            'Message cancelled! Send another message to try again.',
        response_type: 'in_channel'
    });
});

module.exports = slackInteractions;

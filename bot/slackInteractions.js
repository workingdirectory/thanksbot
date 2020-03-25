const { createMessageAdapter } = require('@slack/interactive-messages');
const slackWeb = require('./slackWeb');

const slackInteractions = createMessageAdapter(
    process.env.SLACK_SIGNING_SECRET
);

slackInteractions.action({ type: 'button' }, (payload, respond) => {
    const {
        user,
        actions,
        team: { id }
    } = payload;
    const tyConfirmed = actions[0].value !== 'cancel';
    const webAPI = new slackWeb(id);

    if (tyConfirmed) {
        respond({
            text:
                'Thank you for your submission! It will be shared in the weekly digest.',
            response_type: 'in_channel'
        });
        webAPI.storeThankYou(user, actions[0].value);
    } else {
        respond({
            text:
                'Message cancelled! Submit another thank you if you to publish your message.',
            response_type: 'in_channel'
        });
    }
});

module.exports = slackInteractions;

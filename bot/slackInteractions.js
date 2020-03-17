const { createMessageAdapter } = require('@slack/interactive-messages');
const { storeThankYou } = require('./slackWeb');

const slackInteractions = createMessageAdapter(
    process.env.SLACK_SIGNING_SECRET
);

slackInteractions.action({ type: 'button' }, (payload, respond) => {
    const { user, actions } = payload;
    const tyConfirmed = actions[0].value !== 'cancel';

    if (tyConfirmed) {
        respond({
            text:
                'Thank you for your submission! It will be shared in the weekly digest.',
            response_type: 'in_channel'
        });
        storeThankYou(user, actions[0].value);
    } else {
        respond({
            text:
                'Message cancelled! Submit another thank you if you to publish your message.',
            response_type: 'in_channel'
        });
    }
});

module.exports = slackInteractions;

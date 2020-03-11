const { WebClient } = require('@slack/web-api');

const slackWeb = new WebClient(process.env.SLACK_TOKEN);

function sendReminder() {
    // send reminder in general channel based on workspace setting
}

function sendDigest(text) {
    // post summary of thanks yous to #general channel
}

(async () => {
    try {
        await slackWeb.chat.postMessage({
            channel: '#general',
            text: 'test message',
            post_at: '1583941202216'
        });
        console.log('Message posted!');
    } catch (error) {
        console.log(error);
    }
})();

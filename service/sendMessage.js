const { WebClient } = require('@slack/web-api');

const slackWeb = new WebClient(process.env.SLACK_TOKEN);

(async () => {
    try {
        await slackWeb.chat.postMessage({
            channel: '#general',
            text: 'test message'
        });
        console.log('Message posted!');
    } catch (error) {
        console.log(error);
    }
})();

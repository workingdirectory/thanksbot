const slackWeb = require('../bot/slackWeb');

async function listMessages() {
    const teamId = process.argv.slice(2)[0];
    const webAPI = new slackWeb(teamId);
    const client = await webAPI.getSlackClient();

    client.chat.scheduledMessages
        .list()
        .then(({ scheduled_messages }) => console.log(scheduled_messages));
}

listMessages();

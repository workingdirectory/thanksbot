const { getSlackTeams } = require('../bot/slackAuth');
const slackWeb = require('../bot/slackWeb');

const sendReminder = async function() {
    const teams = await getSlackTeams();

    teams.forEach(team => {
        const webAPI = new slackWeb(team);
        webAPI.tyReminder();
    });
};

sendReminder();

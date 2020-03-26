const dayjs = require('dayjs');
const { getSlackTeams } = require('../bot/slackAuth');
const slackWeb = require('../bot/slackWeb');

const REMINDER_DAY = 4;

const sendReminder = async function() {
    const teams = await getSlackTeams();

    teams.forEach(team => {
        const webAPI = new slackWeb(team);
        webAPI.tyReminder();
    });
};

const today = dayjs().day();

if (today === REMINDER_DAY) {
    sendReminder();
}

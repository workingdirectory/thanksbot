require('dotenv').config();
const express = require('express');
const CronJob = require('cron').CronJob;
const slackInteractions = require('./bot/slackInteractions');
const slackEvents = require('./bot/slackEvents');
const { tyReminder } = require('./bot/slackWeb');

const app = express();
const port = process.env.PORT || 3000;
const reminderMessage = new CronJob(
    '0 9 * * * 3',
    function() {
        tyReminder();
    },
    null,
    true,
    'America/New_York'
);

app.use('/slack/events', slackEvents.requestListener());
app.use('/slack/interactions', slackInteractions.requestListener());
app.use('/slack/auth', (req, res) => {
    console.log('req', req);
});

reminderMessage.start();


app.listen(port, () => console.log(`Listening on ${port}`));

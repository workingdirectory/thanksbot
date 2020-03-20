require('dotenv').config();
const express = require('express');
const CronJob = require('cron').CronJob;
const request = require('request');
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
app.get('/slack/auth', (req, res) => {
    const { code } = req.query;

    const options = {
        uri: 'https://slack.com/api/oauth.access?code='
            +code+
            '&client_id='+process.env.SLACK_CLIENT_ID+
            '&client_secret='+process.env.SLACK_CLIENT_SECRET+
            '&redirect_uri='+process.env.SLACK_REDIRECT_URI,
        method: 'GET'
    }
    request(options, (error, response, body) => {
        var JSONresponse = JSON.parse(body)
        if (!JSONresponse.ok){
            console.log(JSONresponse)
            res.send("Error encountered: \n"+JSON.stringify(JSONresponse)).status(200).end()
        }else{
            console.log('JSONresponse', JSONresponse)
            res.send("Success!")
        }
    })
});

reminderMessage.start();


app.listen(port, () => console.log(`Listening on ${port}`));

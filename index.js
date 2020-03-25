require('dotenv').config();
const express = require('express');
const { authResponse } = require('./bot/slackAuth');
const slackInteractions = require('./bot/slackInteractions');
const slackEvents = require('./bot/slackEvents');

const app = express();
const port = process.env.PORT || 3000;

app.get('/slack/auth', authResponse);
app.use('/slack/events', slackEvents.requestListener());
app.use('/slack/interactions', slackInteractions.requestListener());

app.listen(port, () => console.log(`Listening on ${port}`));

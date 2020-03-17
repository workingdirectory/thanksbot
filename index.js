require('dotenv').config();
const express = require('express');
const slackInteractions = require('./bot/slackInteractions');
const slackEvents = require('./bot/slackEvents');

const app = express();
const port = process.env.PORT || 3000;

app.use('/slack/events', slackEvents.requestListener());
app.use('/slack/interactions', slackInteractions.requestListener());

app.listen(port, () => console.log(`Listening on ${port}`));

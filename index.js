require('dotenv').config();
const { createEventAdapter } = require('@slack/events-api');
const express = require('express');
const { WebClient } = require('@slack/web-api');

const app = express();
const slackWeb = new WebClient(process.env.SLACK_TOKEN);
const slackEvents = createEventAdapter(process.env.SLACK_SIGNING_SECRET);
const port = process.env.PORT || 3000;


app.use('/slack/events', slackEvents.expressMiddleware());

slackEvents.on('message', (event) => {
  console.log('message', event);
});
slackEvents.on('error', console.error);

app.listen(port, () => console.log(`Listening on ${port}`));

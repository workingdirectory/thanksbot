require('dotenv').config();
const express = require('express');
const storeMessage = require('./bot/storeMessage');

const app = express();
const port = process.env.PORT || 3000;

app.use('/slack/events', storeMessage.expressMiddleware());

app.listen(port, () => console.log(`Listening on ${port}`));

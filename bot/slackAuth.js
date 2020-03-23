require('dotenv').config();
const fetch = require('node-fetch');
const { Pool, Client } = require('pg');

const pool = new Pool(process.env.DATABASE_URL);

exports.authResponse = async function(req, res) {
    const { code } = req.query;
    const slackURL =
        'https://slack.com/api/oauth.v2.access?code=' +
        code +
        '&client_id=' +
        process.env.SLACK_CLIENT_ID +
        '&client_secret=' +
        process.env.SLACK_CLIENT_SECRET +
        '&redirect_uri=' +
        process.env.SLACK_REDIRECT_URI;
    const authResponse = await fetch(slackURL).then(res => res.json());
    console.log('authResponse', authResponse);
    if (!authResponse.ok) {
        console.log(authResponse);
        res.send('Error encountered: \n' + JSON.stringify(authResponse))
            .status(200)
            .end();
    } else {
        // TO DO: better celebratory page or redirect to another site?
        res.send('Success!');
    }
};

exports.getSlackToken = function(teamId) {};

const saveSlackToken = function(teamId, token) {
    let client = pool.connect();
};

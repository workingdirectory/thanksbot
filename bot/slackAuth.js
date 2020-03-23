require('dotenv').config();

const crypto = require('crypto');
const fetch = require('node-fetch');
const { Pool } = require('pg');
const { getDbConfig } = require('./dbConfig');

const pool = new Pool(getDbConfig());
const RESIZED_IV = Buffer.allocUnsafe(16);
const KEY = crypto
    .createHash('sha256')
    .update(process.env.CIPHER_KEY)
    .digest();
const IV = crypto
    .createHash('sha256')
    .update(process.env.CIPHER_IV)
    .digest();

IV.copy(RESIZED_IV);

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

    if (!authResponse.ok) {
        console.log(authResponse);
        res.send('Error encountered: \n' + JSON.stringify(authResponse))
            .status(200)
            .end();
    } else {
        const {
            team: { id },
            access_token
        } = authResponse;
        console.log('authResponse', authResponse);
        const saveSuccess = await saveSlackToken(id, access_token);

        if (saveSuccess) {
            // TO DO: better celebratory page or redirect to another site?
            res.send('Success!');
        }

        // TO DO: better error messaging if no save success
    }
};

const decryptToken = function(encryptedToken) {
    const decipher = crypto.createDecipheriv('aes256', KEY, RESIZED_IV);
    let slackToken = decipher.update(encryptedToken, 'hex', 'binary');

    slackToken += decipher.final('binary');

    return slackToken;
};

const encryptToken = function(token) {
    const cipher = crypto.createCipheriv('aes256', KEY, RESIZED_IV);
    let encryptedToken = cipher.update(token, 'binary', 'hex');

    encryptedToken += cipher.final('hex');

    return encryptedToken;
};

exports.getSlackToken = async function(teamId) {
    let slackToken = null;
    let client = await pool.connect();
    const { token } = await client
        .query('SELECT token FROM tokens WHERE team_id = $1', [teamId])
        .then(res => {
            client.release();
            return res.rows[0];
        })
        .catch(e => {
            client.release();
            console.error(e.stack);
            return null;
        });

    if (token) {
        slackToken = decryptToken(token);
    }

    return slackToken;
};

const saveSlackToken = async function(teamId, token) {
    let client = await pool.connect();
    const botToken = encryptToken(token);

    return client
        .query('INSERT INTO tokens (team_id, token) VALUES ($1, $2)', [
            teamId,
            botToken
        ])
        .then(() => {
            client.release();
            return true;
        })
        .catch(e => {
            client.release();
            console.error(e.stack);
            return false;
        });
};

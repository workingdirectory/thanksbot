require('dotenv').config();
const devConfig = require('../database.json').dev;

exports.getDbConfig = function() {
    // This is the environment variable Heroku exposes
    const connectionString = process.env.DATABASE_URL;
    if (connectionString) {
        return {
            connectionString,
            ssl: true,
            sslmode: 'require'
        };
    }

    return devConfig;
};

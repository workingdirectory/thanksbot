'use strict';

exports.up = function(db) {
    return db.createTable('tokens', {
        columns: {
            team_id: { type: 'string', primaryKey: true, unique: true },
            token: 'string'
        },
        ifNotExists: true
    });
};

exports.down = function(db) {
    return db.dropTable('tokens', { ifExists: true });
};

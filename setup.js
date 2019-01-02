
/**
 *
 * setup.js
 *
 * This file will automatically run after npm install vis the postinstall script
 *
 */


const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const pjson = require('./package.json');

// Setup Directories

if (!fs.existsSync(pjson.sms_parser.path.archive)) {
    fs.mkdirSync(pjson.sms_parser.path.archive);
}

if (!fs.existsSync(pjson.sms_parser.path.database)) {
    fs.mkdirSync(pjson.sms_parser.path.database);
}

if (!fs.existsSync(pjson.sms_parser.path.export)) {
    fs.mkdirSync(pjson.sms_parser.path.export);
}

if (!fs.existsSync(pjson.sms_parser.path.import)) {
    fs.mkdirSync(pjson.sms_parser.path.import);
}

// Create database

let db = new sqlite3.Database(pjson.sms_parser.path.database + '/sms-parser.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, createDatabase);

function createDatabase(err) {
    if (err) {
        console.error('Could not create database.', err);
        process.exit(1);
    }

    db.run(`
        CREATE TABLE IF NOT EXISTS SMS (ID int
        , IS_SENT boolean
        , ADDRESS string
        , DISPLAY_DATE string
        , BODY string)
    `);
}

db.close();

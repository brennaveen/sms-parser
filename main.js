const fs = require('fs');
const parseString = require('xml2js').parseString;
const pjson = require('./package.json');
const sqlite3 = require('sqlite3').verbose();

let filters = pjson.sms_parser.contactNames;

let errorCount = 0;
let ignoredCount = 0;
let importCount = 0;
let skippedCount = 0;

// Validate filtering
if (
    !Array.isArray(filters) ||
    !filters.some(isString)
) {
    console.error('contactNames in package.json is not a valid array');
    process.exit(1);
}

// Connect to database
let db = new sqlite3.Database(
    pjson.sms_parser.path.database + '/sms-parser.db',
    sqlite3.OPEN_READWRITE,
    processFiles
);

function isString(value) {
    if (typeof value !== 'string') {
        return false;
    }

    return true;
}

function loadMessage(sms) {
    if (
        filters.length > 0 &&
        filters.indexOf(sms.$.contact_name) == -1
    ) {
        return ignoredCount++;
    }

    let sql = 'SELECT ID FROM SMS WHERE ID = ?';

    // Insert message into database if it doesn't already exist
    db.get(sql, [sms.$.date], (err, row) => {
        if (err) {
            return console.error('Failed to query for existing record', err.message);
        }

        if (!row) {
            let sql =
                'INSERT INTO SMS (ID, IS_SENT, ADDRESS, DISPLAY_DATE, BODY) VALUES (?, ?, ?, ?, ?)';
            let params = [
                sms.$.date,
                sms.$.type == 2 ? 1 : 0,
                sms.$.address.length == 10 ? '+1' + sms.$.address : sms.$.address,
                sms.$.readable_date,
                sms.$.body,
            ];

            db.run(sql, params, err => {
                if (err) {
                    console.log('Failed to insert message...', err);
                    errorCount++;
                } else {
                    importCount++;
                }
            });
        } else {
            skippedCount++;
        }
    });
}

function processFiles(err) {
    if (err) {
        return console.error('Could not connect to database database', err);
    }

    console.log('Connected to database...');

    // Retrieve list of files
    var files = fs.readdirSync(pjson.sms_parser.path.import);

    if (files.length == 0) {
        return console.log('No files found...');
    }

    console.log('Import started: ' + files.length + ' file(s) found...');

    files.forEach(file => {
        let filePath = pjson.sms_parser.path.import + '/' + file;
        let archivePath = pjson.sms_parser.path.archive + '/' + file;
        let fileStat = fs.statSync(filePath);

        var object;

        if (!fileStat.isFile()) {
            return console.log("Skipping '%s', item is not a valid file", filePath);
        }

        // Convert XML to an object for easier processing
        console.log('Reading file (%s)...', filePath);

        parseString(fs.readFileSync(filePath), (err, result) => {
            console.log('Loading messages...');
            if (err) {
                console.log('Failed to convert xml to json', err);
                return (object = false);
            }

            return (object = result);
        });

        if (object !== false) {
            object.smses.sms.forEach(loadMessage);
        }

        console.log('Archiving file...');

        fs.renameSync(filePath, archivePath);
    });
}

db.close(err => {
    console.log('Closing database connection...');
    if (err) {
        return console.error('Failed to close database', err.message);
    }

    console.log(
        'Import complete: ',
        '(' +
            importCount +
            ') imported; (' +
            skippedCount +
            ') skipped; (' +
            errorCount +
            ') errors; (' +
            ignoredCount +
            ') ignored'
    );
});

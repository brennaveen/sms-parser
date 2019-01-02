const fs = require('fs');
const pjson = require('./package.json');
const sqlite3 = require('sqlite3').verbose();

let currentDate = new Date();

let db = new sqlite3.Database(
    pjson.sms_parser.path.database + '/sms-parser.db',
    sqlite3.OPEN_READWRITE,
    err => {
        if (err) {
            console.error('Could not connect to database database', err);
            process.exit(1);
        }

        console.log('Connected to database...');
    }
);

let stream = fs.createWriteStream(
    pjson.sms_parser.path.export + '/sms-' + currentDate.getTime() + '.csv'
);

stream.once('open', fd => {
    let sql = `SELECT CASE WHEN IS_SENT = 0 THEN 'Received' ELSE 'Sent' END AS 'TYPE'
            , ADDRESS
            , REPLACE(DISPLAY_DATE, ',', '') AS 'DISPLAY_DATE'
            , REPLACE(REPLACE(body, ',', '","'), X'0A', ' ') AS 'BODY'
        FROM SMS
        ORDER BY ID`;

    console.log('Writing messages to file...');

    db.each(
        sql,
        (err, row) => {
            if (err) {
                return console.error(err.message);
            }

            stream.write(
                row.DISPLAY_DATE +
                    ',' +
                    row.TYPE +
                    ',' +
                    row.DISPLAY_DATE +
                    ',' +
                    row.ADDRESS +
                    ',' +
                    row.BODY +
                    '\n'
            );
        },
        () => {
            // Close file
            console.log('Finalizing file...');
            stream.end();
        }
    );
});

stream.once('finish', rs => {
    closeDatabase();
});

stream.on('error', err => {
    console.error('Failed to create file', err);
    closeDatabase();
    process.exit(1);
});

function closeDatabase() {
    console.log('Closing database connection...');
    db.close(err => {
        if (err) {
            return console.error('Failed to close database', err.message);
        }

        console.log('Export complete');
    });
}

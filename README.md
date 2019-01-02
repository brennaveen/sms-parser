# sms-parser
Node application for converting [SMS Backup &amp; Restore](https://play.google.com/store/apps/details?id=com.riteshsahu.SMSBackupRestore) backup files into a csv for easy viewing and printing

## Installation
1. Clone or download package
2. Open package.json
3. Add contact names if filtering is desired `[ "Mom", "Dad" ]`, you can change this at any time
4. Open terminal inside folder
5. Run npm run install in terminal

## Importing Files
1. Place SMS Backup & Restore xml files in the import directory
2. Open terminal inside folder
3. Run `npm run import` in terminal

## Exporting Text Messages
1. Open terminal inside folder
2. Run `npm export` in terminal
3. View file in export directory

## Considerations
Messages will not contain images or emojis
/**
 * @author iitii
 * @date 2020/11/24 18:11
 */
'use strict';
const {logger} = require('../libs/logger'),
    import_export = require('../models/import_export'),
    path = require('path')
const import_filePath = path.resolve(__dirname, process.env.IMPORT_FILEPATH || '../logs/dump.json');

(async () => {
    logger.info(`Importing redis data...`);
    // keyValuePair
    logger.info(`Importing keyValuePair...`);
    await import_export.loadFromFile(import_filePath)
        .then(() => logger.info(`Successfully load data from file: ${import_filePath}`))
        .catch(e => logger.error(e));
    await import_export.insertKeyValuePairIntoRedis()
        .then(res => {
            logger.info(`Successfully imported ${res.length} key Value pairs!!!`);
        })
        .catch(e => logger.error(e))
        .finally(() => {
            import_export.quit();
        });
})()

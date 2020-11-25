/**
 * @author iitii
 * @date 2020/11/24 17:03
 */
const client = require('../libs/redis_command'),
    {logger} = require('../libs/logger'),
    import_export = require('../models/import_export'),
    path = require('path'),
    events = require('events'),
    eventEmitter = new events.EventEmitter();
const export_filePath = path.resolve(__dirname, process.env.RXPORT_FILEPATH || '../logs/dump.json');

let failed = [];

//在遍历所有 keyValue 以及 list 以后对剩余的 key 进行进一步处理
eventEmitter.on('listOver', async others => {
    logger.info(`eventEmitter 'listOver' receive count: ${others.length}`);
    logger.debug(others);
    import_export.saveToFile(export_filePath);
    client.quit();
    if (others.length !== 0) {
        logger.warn(`Unknown key: ${others}`);
    }
});

//在遍历所有 keyValue 以后对剩余的 key 进行进一步处理
eventEmitter.on('keyValuePairOver', async others => {
    logger.info(`eventEmitter 'keyValuePairOver' receive count: ${others.length}`);
    logger.debug(others);
    let tmpKey = failed.shift();
    let tmpFailed = [];
    while (tmpKey !== undefined) {
        await client.lrange(tmpKey)
            .then(lists => import_export.addList(tmpKey, lists))
            .catch(err => tmpFailed.push(err))
            .finally(() => {
                tmpKey = failed.shift();
            });
    }
    failed = tmpFailed;
    logger.info(`list failed count: ${failed.length}`);
    logger.debug(failed);
    logger.debug(import_export.stringify());
    eventEmitter.emit('listOver', failed);
});

logger.info(`Exporting redis data...`);
//获取所有keys
client.keys('*')
    .then(async keys => {
        for (const key of keys) {
            // TODO: 使用 multi + 事务优化执行速度
            // See: https://github.com/NodeRedis/node-redis#optimistic-locks
            await client.get(key)
                .then(value => import_export.addKeyValuePair([key, value]))
                .catch(err => failed.push(err));
        }
    })
    .catch(e => {
        logger.fatal(e);
    }).finally(() => {
    logger.info(`keyValuePair failed count: ${failed.length}`);
    logger.debug(failed);
    logger.debug(import_export.stringify());
    eventEmitter.emit('keyValuePairOver', failed);
});

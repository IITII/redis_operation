/**
 * @author iitii
 * @date 2020/11/24 20:37
 */
'use strict';
const log4js = require("log4js"),
    path = require('path');

log4js.configure({
    appenders: {
        stdout: {
            type: 'stdout',
            layout: {
                type: 'colored'
            }
        },
        dateFile: {
            type: 'dateFile',
            filename: path.resolve(__dirname,'../logs/redis_operation.log'),
            pattern: '.yyyy-MM-dd',
            compress: true
        }
    },
    categories: {
        default: {
            appenders: ['stdout', 'dateFile'],
            level: process.env.LOGGER_LEVEL || 'debug'
        }
    }
});
const logger = log4js.getLogger("redis_op");

module.exports = {
    logger
}

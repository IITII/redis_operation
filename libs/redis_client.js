/**
 * @author iitii
 * @date 2020/11/24 17:23
 */
'use strict';
const redisConfig = {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
}
const redis = require('redis'),
    // https://github.com/NodeRedis/node-redis#rediscreateclient
    client = redis.createClient(redisConfig);

module.exports = {
    client
};

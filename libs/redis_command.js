/**
 * @author iitii
 * @date 2020/11/25 11:54
 */
'use strict';
const {client} = require('../libs/redis_client')

/**
 * Redis promisify send_command
 * @param command redis command
 * @param args command arguments
 * @returns key 对应对 value，或者出错返回该key。出错原因可能是因为数据结构不同，需要进一步处理。
 */
async function send_command(command, args) {
    return await new Promise((resolve, reject) => {
        client.send_command(command, args, (err, value) => {
            if (err) {
                return reject(args[0]);
            } else {
                return resolve(value);
            }
        });
    })
}

/**
 * 同步阻塞通过 key 获取 value
 * @param key redis key
 * @returns key 对应对 value，或者出错返回该key。出错原因可能是因为数据结构不同，需要进一步处理。
 */
function get(key) {
    return send_command('get', [key]);
}


function set(key, value) {
    return send_command('set', [key, value]);
}

async function multiSet(keyValuePair) {
    return await new Promise((resolve, reject) => {
        if (!Array.isArray(keyValuePair)) {
            return reject(`Arguments should be a array`);
        }
        const multi_set = client.multi();
        for (const pair of keyValuePair) {
            if (!Array.isArray(pair) || pair.length !== 2) {
                return reject(pair);
            }
            multi_set.set(pair[0], pair[1]);
        }
        multi_set.exec((err, res) => {
            if (err) {
                return reject(err);
            } else {
                return resolve(res);
            }
        });
    });
}

function keys(pattern) {
    return send_command('keys', [pattern]);
}

function lrange(key, lowIndex = 0, highIndex = -1) {
    return send_command('lrange', [key, lowIndex, highIndex]);
}

function quit() {
    return client.quit();
}

module.exports = {
    send_command,
    get,
    set,
    multiSet,
    keys,
    lrange,
    quit,
}

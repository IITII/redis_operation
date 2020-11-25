/**
 * @author iitii
 * @date 2020/11/24 17:33
 */
'use strict';
const {validator, instance} = require('./data_validation'),
    {logger} = require('../libs/logger'),
    client = require('../libs/redis_command'),
    path = require('path'),
    fs = require('fs');
let data = instance;

/**
 * 添加一个 key_value 对
 * @param key_value_pair {Array} [key,value]
 */
function addKeyValuePair(key_value_pair) {
    if (Array.isArray(key_value_pair)) {
        data.key_values.push(key_value_pair);
    } else {
        throw new Error("argument should be a Array");
    }
}

/**
 * 添加一个 list
 * @param key list key
 * @param list {Array} [key,[value,value]]
 */
function addList(key, list) {
    if (Array.isArray(list)) {
        data.lists[key] = list;
    } else {
        throw new Error("argument should be a Array");
    }
}

/**
 * 返回 stringify 后的结果
 */
function stringify() {
    return JSON.stringify(data);
}

/**
 * 从 JSON 数据或者 string 尝试导入数据
 * @param stringData {String|JSON} redis 数据
 */
function parse(stringData) {
    if (typeof stringData === "string") {
        stringData = JSON.parse(stringData);
    }
    if (validator(stringData)) {
        data = stringData;
    } else {
        throw new Error("Validate Error")
    }
}

/**
 * 重置数据
 */
function clean() {
    data = instance;
}

/**
 * 从指定文件加载数据
 * @param filePath {String} 文件路径
 */
async function loadFromFile(filePath) {
    return await new Promise((resolve, reject) => {
        if (!fs.existsSync(filePath)) {
            return reject(`The special file path is not exist: ${filePath}`);
        }
        try {
            fs.accessSync(filePath, fs.constants.R_OK);
        } catch (e) {
            return reject(e.message);
        }
        const data = [];
        const readStream = fs.createReadStream(filePath);
        readStream.on('data', chunk => data.push(chunk));
        readStream.on('close', () => {
            parse(Buffer.concat(data).toString());
            return resolve();
        });
    });

}

/**
 * 保存到指定文件
 * @param filePath {String} 文件路径
 */
function saveToFile(filePath = path.resolve(__dirname, '../logs/dump.json')) {
    try {
        if (fs.existsSync(filePath)) {
            // 若文件存在判断是否有写入权限
            logger.warn(`File is already exist, will be rewriting...`);
            fs.accessSync(filePath, fs.constants.W_OK);
        } else {
            // 文件不存在则判断对当前目录是否有写入权限
            fs.accessSync(path.dirname(filePath), fs.constants.W_OK);
        }
    } catch (e) {
        throw new Error(e.message);
    }
    fs.writeFileSync(filePath, stringify());
    logger.info(`数据写入成功，文件路径: ${filePath}`);
}

async function insertKeyValuePairIntoRedis() {
    return await new Promise(async (resolve, reject) => {
        // for (const key of data.key_values){
        //     await client.set(key[0],key[1])
        //         .catch(e => reject(e));
        // }
        client.multiSet(data.key_values)
            .then(res => resolve(res))
            .catch(e => reject(e));
    });
}

function quit(){
    return client.quit();
}

module.exports = {
    addKeyValuePair,
    addList,
    stringify,
    parse,
    clean,
    loadFromFile,
    saveToFile,
    insertKeyValuePairIntoRedis,
    quit,
}

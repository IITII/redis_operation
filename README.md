# redis_operation

## 一些 redis 常用操作  

> 环境变量   

|      Param      |       Default       |          Description          |
| :-------------: | :-----------------: | :---------------------------: |
|   REDIS_HOST    |    ` 127.0.0.1 `    |          redis host           |
|   REDIS_PORT    |       `6379`        |          redis port           |
|  LOGGER_LEVEL   |       `debug`       | 日志级别 (info, debug, error) |
| RXPORT_FILEPATH | `../logs/dump.json` |         数据导出位置          |
| IMPORT_FILEPATH | `../logs/dump.json` |         数据导入位置          |

### redis 导出
```bash
npm run export
```
### redis 导入
```
npm run import
```


## 内置 Redis 导入导出方法

> See: https://redis.io/topics/persistence  

### RDB 文件
#### export
```bash
CONTAINER_NAME="redis"
REDIS_HOST="127.0.0.1"
REDIS_PORT="6379"
DUMP_FILE="dump.rdb"
## export
docker exec -it ${CONTAINER_NAME} redis-cli -h ${REDIS_HOST} -p ${REDIS_PORT} --rdb ${DUMP_FILE}
# wait for writing file
sleep 10
docker cp ${CONTAINER_NAME}:/data/${DUMP_FILE} /tmp/${DUMP_FILE}
```

#### import
1. 使用 `redis-cli save` 或者 `redis-cli -h ${REDIS_HOST} -p ${REDIS_PORT} --rdb ${DUMP_FILE}` 导出 `redis` 数据
2. 通过 `redis-cli config get dir` 获取 `redis 数据文件` 的存储位置
3. 停止`欲导入数据的redis`
4. 删除`欲导入数据的redis`的 `RDB` 文件
5. 复制导出的 redis 的 `RDB` 文件到相同的位置，直接覆盖，启动 `欲导入数据redis`

### AOF 文件
#### export
```bash
CONTAINER_NAME="redis"
REDIS_HOST="127.0.0.1"
REDIS_PORT="6379"
DUMP_FILE="appendonly.aof"
docker exec -it ${CONTAINER_NAME} redis-cli -h ${REDIS_HOST} -p ${REDIS_PORT} config set appendonly yes
# wait for writing file
sleep 10
docker cp ${CONTAINER_NAME}:/data/${DUMP_FILE} /tmp/${DUMP_FILE}
```

#### import
1. 使用 `redis-cli config set appendonly yes` 或者 `redis-cli -h ${REDIS_HOST} -p ${REDIS_PORT} -a ${REDIS_PASSWORD} config set appendonly yes` 导出 `redis` 数据
2. 通过 `redis-cli config get dir` 获取 `redis 数据文件` 的存储位置
3. 通过AOF文件将数据导入到新的Redis（假定生成的AOF文件名为 `appendonly.aof`）
```bash
redis-cli --pipe < appendonly.aof
#redis-cli -h ${REDIS_HOST} -p ${REDIS_PORT} -a ${REDIS_PASSWORD} --pipe < appendonly.aof
```
4. 可选: 关闭AOF: `redis-cli config set appendonly no` or `redis-cli -h ${REDIS_HOST} -p ${REDIS_PORT} -a ${REDIS_PASSWORD} config set appendonly no`

const redis = require('redis'); 
require('dotenv').config();

const redisClient = redis.createClient(
    process.env.port_redis, 'redis');

module.export = redisClient;  

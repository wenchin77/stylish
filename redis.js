// redis server setup
const redis = require('redis');

const REDIS_PORT = process.env.PORT || 6379;
const redis_client = redis.createClient(REDIS_PORT);

redis_client.on('connect', () => {
  console.log('Redis server running on port 6379');
});

redis_client.on('error', (err) => {
  console.log('Redis server error', err);
});

module.exports = redis_client;

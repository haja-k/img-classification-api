const redis = require('redis')
const redisURL = process.env.REDIS_URL

// in deployment, comment out the socket bracket
const redisClient = redis.createClient({
  // socket: {
    url: redisURL,
    return_buffers: true
  // }
})
/* eslint-disable */
redisClient.on('error', function (err) {
  console.error('Redis Status: Could not establish a connection ' + err)
})
redisClient.on('connect', function (err) {
  console.log('Redis Status: Connection established.')
})
/* eslint-enable */

module.exports = {
  redisClient
}

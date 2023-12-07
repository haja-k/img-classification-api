const session = require('express-session')
const connectRedis = require('connect-redis')
const RedisStore = connectRedis(session)
const appRoot = require('app-root-path')
const { redisClient } = require(`${appRoot}/src/config/redis`)

module.exports = session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  name: 'sessionId',
  cookie: {
    secure: false, // if true: only transcript over https. set it during  production
    httpOnly: true, // if true: prevents client side JS from reading the cookie & cant use swagger
    maxAge: 1000 * 60 * 30
  }
})

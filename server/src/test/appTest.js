const appRoot = require('app-root-path')
require('dotenv').config({ path: '.env.testing' })
const express = require('express')
const cors = require('cors')
const session = require(`${appRoot}/src/middleware/session`)
const app = express()

const corsOptions = {
  credentials: true,
  origin: function (origin, callback) {
    callback(null, true)
  }
}
app.use(express.json())
app.use(session)
app.use(cors(corsOptions))

app.use('/auth', require(`${appRoot}/src/routes/authRoutes`))
app.use('/admin', require(`${appRoot}/src/routes/adminRoutes`))
app.use('/user', require(`${appRoot}/src/routes/userRoutes`))

module.exports = app

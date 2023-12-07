'use strict'

const fs = require('fs')
const path = require('path')
const { Sequelize, DataTypes } = require('sequelize')
const dotenv = require('dotenv')
const basename = path.basename(__filename)
// const env = (process.env.NODE_ENV || 'local').trim()
const db = {}

// Load environment variables from .env file
dotenv.config()

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  dialectOptions: {},
  timezone: '+08:00'
})

fs.readdirSync(__dirname)
  .filter(file => file !== basename && file.slice(-3) === '.js')
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, DataTypes)
    db[model.name] = model
  })

Object.values(db)
  .filter(model => typeof model.associate === 'function')
  .forEach(model => model.associate(db))

db.sequelize = sequelize
db.Sequelize = Sequelize

module.exports = db

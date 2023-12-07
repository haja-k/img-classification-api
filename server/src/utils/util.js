const appRoot = require('app-root-path')
const path = require('path')
const moment = require('moment-timezone')
const fs = require('fs')

const logger = require(`${appRoot}/src/plugins/logger`)
const filePath = `${appRoot}/src/config/messages.json`

const messenger = require(`${appRoot}/src/helper/messenger`)
const process = require(`${appRoot}/src/helper/process`)
const trainer = require(`${appRoot}/src/helper/trainers`)
const finder = require(`${appRoot}/src/helper/finder`)
const redis = require(`${appRoot}/src/helper/redis`)
const ldap = require(`${appRoot}/src/helper/ldap`)
const bcrypt = require(`${appRoot}/src/helper/bcrypt`)
const obs = require(`${appRoot}/src/helper/obs`)

const authenticate = require(`${appRoot}/src/middleware/authenticate`)
const restrictAccess = require(`${appRoot}/src/middleware/restrictAccess`)
const updateActivityTimestamp = require(`${appRoot}/src/middleware/activityTimestamp`)
const upload = require(`${appRoot}/src/middleware/multer`)

const database = require(`${appRoot}/src/sequelize/models`)
const usersSvc = require(`${appRoot}/src/services/UserServices`)
const groupsSvc = require(`${appRoot}/src/services/GroupServices`)
const projectSvc = require(`${appRoot}/src/services/ProjectServices`)
const dropdownSvc = require(`${appRoot}/src/services/DropdownServices`)

module.exports = {
  path,
  moment,
  logger,
  fs,
  messenger,
  filePath,
  process,
  trainer,
  finder,
  redis,
  ldap,
  obs,
  bcrypt,
  authenticate,
  restrictAccess,
  updateActivityTimestamp,
  upload,
  database,
  usersSvc,
  groupsSvc,
  projectSvc,
  dropdownSvc
}

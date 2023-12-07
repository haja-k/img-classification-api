const appRoot = require('app-root-path')
const logger = require(`${appRoot}/src/plugins/logger`)
const usersSvc = require(`${appRoot}/src/services/UserServices`)
const messenger = require(`${appRoot}/src/helper/messenger`)
const filePath = `${appRoot}/src/config/messages.json`
const directory = __dirname.split(require('path').sep).pop() // Import path module

async function checkUserPresence (username) {
  try {
    const user = await usersSvc.getUser(username)
    const messageKey = user ? 'userExists' : 'userNotFound'
    const message = messenger(filePath, messageKey)
    const error = !user

    logger[error ? 'error' : 'info'](`[${directory}] ${message} ${username}`)

    return {
      error,
      message: `${message} ${username}`
    }
  } catch (error) {
    logger.error(`[${directory}] Error checking user presence: ${error}`)
    const errorMessage = messenger(filePath, 'userPresenceError')

    return {
      error: true,
      message: `${errorMessage} ${username}`
    }
  }
}

async function getUserData (username) {
  try {
    const user = await usersSvc.getUser(username)
    const messageKey = user ? 'userExists' : 'userNotFound'
    const message = messenger(filePath, messageKey)
    const error = !user
    logger[error ? 'error' : 'info'](`[${directory}] ${message} ${username}`)
    return {
      error,
      message: `${message} ${username}`,
      data: user
    }
  } catch (error) {
    logger.error(`[${directory}] Error retrieving user data: ${error}`)
    const errorMessage = messenger(filePath, 'userDataRetrieveError')

    return {
      error: true,
      message: `${username.toUpperCase()}: ${errorMessage} `
    }
  }
}

async function updateLoginTime (username) {
  try {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const seconds = String(now.getSeconds()).padStart(2, '0')
    const timestamp = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    await usersSvc.updateLoginTimestamp(timestamp, username)

    logger.info(`[${directory}] ${username} is logged in at ${timestamp}`)
    return true
  } catch (error) {
    return false
  }
}

module.exports = {
  checkUserPresence,
  getUserData,
  updateLoginTime
}

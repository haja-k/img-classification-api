const appRoot = require('app-root-path')
const logger = require(`${appRoot}/src/plugins/logger`)
const { redisClient } = require(`${appRoot}/src/config/redis`)
const moment = require('moment-timezone')
const util = require('util')
const redisGetAsync = util.promisify(redisClient.get).bind(redisClient)

function parseSessionData (sessionData) {
  const sessionObject = JSON.parse(sessionData)
  if (sessionObject && sessionObject.user && sessionObject.roleID) {
    const dateStr = sessionObject.cookie.expires
    const klDateTime = moment.tz(dateStr, 'Asia/Kuala_Lumpur')
    const klFormattedDateTime = klDateTime.format('DD-MM-YYYY HH:mm:ss')
    if (!sessionObject.project) {
      return {
        success: true,
        userID: sessionObject.userID,
        user: sessionObject.user,
        userRole: sessionObject.roleID,
        sessionExpiration: klFormattedDateTime
      }
    } else {
      const project = sessionObject.project
      return {
        success: true,
        userID: sessionObject.userID,
        user: sessionObject.user,
        userRole: sessionObject.roleID,
        sessionExpiration: klFormattedDateTime,
        project
      }
    }
  } else {
    return { success: false }
  }
}

async function getSessionData (req) {
  try {
    const sessionData = await redisGetAsync(`sess:${req.sessionID}`)
    if (!sessionData) {
      return { success: false }
    }
    const userSession = parseSessionData(sessionData, req.sessionID)
    return userSession
  } catch (error) {
    logger.error(error)
    return { success: false }
  }
}

async function storeSessionData (req) {
  try {
    await redisClient.set(`sess:${req.sessionID}`, JSON.stringify(req.session.project))
    /* eslint-disable */
    const sessionData = await redisGetAsync(`sess:${req.sessionID}`)
    /* eslint-enable */
    return { success: true }
  } catch (error) {
    logger.error('Failed to store session data in Redis:', error)
    return { success: false }
  }
}

async function deleteProjectData (req) {
  try {
    const sessionData = await redisGetAsync(`sess:${req.sessionID}`)
    if (!sessionData) {
      return { success: false, message: 'Session data not found' }
    }
    const sessionObject = JSON.parse(sessionData)
    if (sessionObject && sessionObject.project) {
      delete sessionObject.project
      await redisClient.set(`sess:${req.sessionID}`, JSON.stringify(sessionObject))
      return { success: true, message: 'Project session data cleared' }
    } else {
      return { success: false, message: 'No project data in session' }
    }
  } catch (error) {
    logger.error('Failed to delete project data from Redis:', error)
    return { success: false, message: 'Internal server error' }
  }
}

module.exports = {
  getSessionData,
  storeSessionData,
  deleteProjectData
}

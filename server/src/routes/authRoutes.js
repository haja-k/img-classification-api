const express = require('express')
const router = express.Router()
const appRoot = require('app-root-path')
const authCtrl = require(`${appRoot}/src/controllers/authCtrl`)
const { path, logger, messenger, filePath, authenticate, updateActivityTimestamp } = require(`${appRoot}/src/utils/util`)
const fileName = __filename.split(path.sep).pop()
const directory = __dirname.split(require('path').sep).pop()

router.post('/', async (req, res) => {
  /**
    #swagger.tags = [{ "vitality" }]
    #swagger.description = "health check"
    #swagger.responses['200'] = { description: "API call is successful" }
    #swagger.responses['500'] = { description: "Server Error" }
  */
  try {
    const apiHealth = await authCtrl.initMessage(req, res)
    return apiHealth
  } catch (error) {
    logger.error(`[${directory}/${fileName}/] ${error}`)
    res.status(500).send(messenger(filePath, 'internalError'))
  }
})

router.post('/login', async (req, res) => {
  /**
    #swagger.tags = [{ "auth" }]
    #swagger.description = "User Login"
    #swagger.parameters['credentials'] = {
      in: 'body',
      required: false,
      schema: {
        email: "dwightschrute@sains.com.my",
        password: "dwightschrute"
      }
    }
    #swagger.responses['200'] = { description: "API call is successful" }
    #swagger.responses['500'] = { description: "Server Error" }
  */
  try {
    const authenticationResult = await authCtrl.userLogin(req, res)
    return authenticationResult
  } catch (error) {
    logger.error(`[${directory}/${fileName}/login] ${error}`)
    res.status(500).send(messenger(filePath, 'internalError'))
  }
})

router.use(authenticate)

router.post('/logout', async (req, res) => {
  /**
    #swagger.tags = [{ "auth" }]
    #swagger.description = "User Log Out"
    #swagger.responses['200'] = { description: "API call is successful" }
    #swagger.responses['500'] = { description: "Server Error" }
  */
  try {
    const userOut = await authCtrl.userLogout(req, res)
    return userOut
  } catch (error) {
    logger.error(`[${directory}/${fileName}/logout] ${error}`)
    res.status(500).send(messenger(filePath, 'internalError'))
  }
})

router.use(updateActivityTimestamp)

router.get('/session-check', async (req, res) => {
  /**
    #swagger.tags = [{ "auth" }]
    #swagger.description = "Checking session data stored in Redis and to see if user have a valid session"
    #swagger.responses['200'] = { description: "API call is successful" }
    #swagger.responses['500'] = { description: "Server Error" }
  */
  try {
    const sessionVerify = await authCtrl.userSession(req, res)
    return sessionVerify
  } catch (error) {
    logger.error(`[${directory}/${fileName}/session-check] ${error}`)
    res.status(500).send(messenger(filePath, 'internalError'))
  }
})

module.exports = router

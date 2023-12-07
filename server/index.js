const appRoot = require('app-root-path')
require('dotenv').config({ path: '.env.local' })
const appSetup = require(`${appRoot}/setup`)
const logger = require(`${appRoot}/src/plugins/logger`)
const fancyConsoleLog = require(`${appRoot}/src/plugins/logMessage`)
const generateSwagger = require(`${appRoot}/swagger/swaggerGeneration`)
const cron = require('node-cron')
const fetchCron = require(`${appRoot}/src/helper/process`)
const port = process.env.NODE_PORT || 4000
const appURL = process.env.APP_URL || 'http://localhost'
const http = require('http')
const createSocketIO = require(`${appRoot}/src/middleware/socketIO`)

generateSwagger()
  .then(combinedSwagger => {
    // const app = appSetup(combinedSwagger)
    const server = http.createServer(appSetup(combinedSwagger)) // Create the server here

    // Initialize Socket.IO after creating the server
    createSocketIO(server)

    server.listen(port, () => {
      const logMessage = `Hold tight! The app is about to launch at ${appURL}:${port} 🚀`
      fancyConsoleLog(logMessage)
    })

    const allLogDirectory = `${appRoot}/logs/all`
    const errorLogDirectory = `${appRoot}/logs/error`
    const uploadImgDir = `${appRoot}/tmp/upload`
    const downloadImgDir = `${appRoot}/tmp/download`

    cron.schedule('0 0 * * *', () => {
      logger.info('[/cron/allLogDirectory] Deleting 1 month old logs if exists')
      fetchCron.deleteOldLogFiles(allLogDirectory)
    })
    cron.schedule('0 0 * * *', () => {
      logger.info('[/cron/errorLogDirectory] Deleting 1 month old logs if exists')
      fetchCron.deleteOldLogFiles(errorLogDirectory)
    })
    cron.schedule('0 0 * * *', () => {
      logger.info('[/cron/modelEraser] Deleting 1 day old images for upload if exists')
      fetchCron.deleteFolders(uploadImgDir)
    })
    cron.schedule('0 0 * * *', () => {
      logger.info('[/cron/modelEraser] Deleting 1 day old images for download if exists')
      fetchCron.deleteFolders(downloadImgDir)
    })

    // Exclude Swagger files from nodemon watch
    server.on('listening', () => {
      const watcher = server._connectionKey.split(':')[1]
      if (watcher) {
        process.nextTick(() => {
          watcher.ignore(`${appRoot}/swagger/documentations/authRoutesSwagger.json`)
          watcher.ignore(`${appRoot}/swagger/documentations/adminRoutesSwagger.json`)
          watcher.ignore(`${appRoot}/swagger/documentations/userRoutesSwagger.json`)
          watcher.ignore(`${appRoot}/swagger/documentations/restrictedRoutesSwagger.json`)
        })
      }
    })
  })
  .catch((error) => {
    logger.error('Error initializing the server:', error)
    process.exit(1)
  })

const workerURL = process.env.WORKER_URL
const request = require('request')
const appRoot = require('app-root-path')
const { path, logger } = require(`${appRoot}/src/utils/util`)
const fileName = __filename.split(path.sep).pop()
const directory = __dirname.split(path.sep).pop()

module.exports = {
  trainingData: async (projectID, projectVersionID, projectData) => {
    console.log('🚀 ~ file: training.js:10 ~ trainingData: ~ projectData:', projectData)
    const requestOptions = {
      url: workerURL + '/start_training/',
      method: 'POST',
      json: true,
      body: projectData
    }
    try {
      return new Promise((resolve, reject) => {
        request(requestOptions, (error, response, body) => {
          if (error) {
            logger.error(`[${directory}/${fileName}/trainingData] Reaching out to the worker failed - ${error}`)
            reject(error)
          } else {
            if (JSON.stringify(body) === undefined) {
              logger.info(`[${directory}/${fileName}/trainingData] Worker did not accept request for project-${projectID}.${projectVersionID}.`)
              resolve({
                success: false
              })
            } else {
              logger.info(`[${directory}/${fileName}/trainingData] Worker accepted request for project-${projectID}.${projectVersionID}. TaskID: ${body.task_id}`)
              resolve({
                success: true,
                data: body.task_id
              })
            }
          }
        })
      })
    } catch (error) {
      logger.error(`[${directory}/${fileName}/trainingData] Worker preprocessing error for project-${projectID}.${projectVersionID}: ${error}`)
      return {
        success: false,
        message: error
      }
    }
  },
  trainingProgress: async (taskID) => {
    const requestOptions = {
      url: workerURL + '/check_training_progress/' + taskID,
      method: 'GET'
    }
    try {
      return new Promise((resolve, reject) => {
        request(requestOptions, (error, response, body) => {
          if (error) {
            logger.error(`[${directory}/${fileName}/trainingProgress] Reaching out to worker failed.`)
            reject(error)
          } else {
            if (body === undefined) {
              logger.info(`[${directory}/${fileName}/trainingProgress] Worker did not accept request for task-${taskID}`)
              resolve({
                success: false,
                data: body.detail
              })
            } else if (body === 'Internal Server Error') {
              resolve({
                success: false,
                data: body
              })
            } else if (JSON.parse(body).detail !== undefined) {
              resolve({
                success: false,
                data: body
              })
            } else {
              logger.info(`[${directory}/${fileName}/trainingProgress] Worker accepted request for task-${taskID}`)
              if (body.status === 'COMPLETED') {
                resolve({
                  success: true,
                  data: body
                })
              } else {
                resolve({
                  success: true,
                  data: body
                })
              }
            }
          }
        })
      })
    } catch (error) {
      logger.error(`[${directory}/${fileName}/trainingProgress] Worker preprocessing progress error for task-${taskID}: ${error}`)
      return {
        success: false,
        message: error
      }
    }
  }
}
